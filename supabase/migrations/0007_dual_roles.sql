-- =============================================================================
-- MentorConnect — Migration 0007
--   Double rôle : une même personne (même adresse e-mail) peut être mentor
--   dans son domaine ET mentorée dans un autre, et passer d'un mode à l'autre.
--
--   - profiles.role devient le MODE ACTIF (mentor ou mentoré)
--   - profiles.is_mentor / is_mentee : profil de ce rôle complété
--     (garanti par des contraintes : impossible de se déclarer mentor sans
--      poste ni 3 ans d'expérience)
--   - profiles.needs : besoins précis du mentoré (skills = compétences du mentor)
--   - profile_domains.as_role : expertises (mentor) ≠ centres d'intérêt (mentoré)
--   - switch_role() : seul moyen de changer de mode
--   - Les règles « agir en mentor / en mentoré » exigent le mode actif ET le
--     profil complet de ce rôle.
-- À exécuter UNE fois, APRÈS 0001 à 0006, dans Supabase > SQL Editor.
-- =============================================================================

-- 1. Nouveaux champs ------------------------------------------------------------
alter table public.profiles
  add column if not exists is_mentor boolean not null default false,
  add column if not exists is_mentee boolean not null default false,
  add column if not exists needs text[] not null default '{}'
    check (cardinality(needs) <= 10 and char_length(array_to_string(needs, '|')) <= 500);

-- Reprise de l'existant : un profil complété l'est pour son rôle actuel
-- (un mentor sans poste ou avec moins de 3 ans devra compléter son profil)
update public.profiles
set is_mentor = (role = 'mentor' and onboarded and job_title is not null and coalesce(years_experience, 0) >= 3),
    is_mentee = (role = 'mentee' and onboarded and mentee_status is not null and goals_summary is not null);

-- Les « compétences » saisies par les mentorés étaient en fait leurs besoins
update public.profiles set needs = skills, skills = '{}' where role = 'mentee';

alter table public.profiles
  add constraint profiles_mentor_ready check (
    not is_mentor or (job_title is not null and years_experience >= 3)
  ),
  add constraint profiles_mentee_ready check (
    not is_mentee or (mentee_status is not null and goals_summary is not null)
  );

grant update (is_mentor, is_mentee, needs) on public.profiles to authenticated;

-- 2. Domaines par rôle --------------------------------------------------------------
alter table public.profile_domains add column if not exists as_role public.user_role;
update public.profile_domains pd set as_role = p.role from public.profiles p where p.id = pd.profile_id and pd.as_role is null;
alter table public.profile_domains alter column as_role set not null;
alter table public.profile_domains drop constraint profile_domains_pkey;
alter table public.profile_domains add primary key (profile_id, domain_id, as_role);

-- 3. Fonctions ------------------------------------------------------------------------
-- En mode mentor ET profil mentor complet
create function public.is_active_mentor()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'mentor' and is_mentor
  );
$$;

-- En mode mentoré ET profil mentoré complet
create function public.is_active_mentee()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'mentee' and is_mentee
  );
$$;

-- Changer de mode (la colonne role reste interdite en écriture directe)
create function public.switch_role(p_role public.user_role)
returns void
language sql volatile security definer set search_path = ''
as $$
  update public.profiles set role = p_role where id = (select auth.uid());
$$;

revoke execute on function public.is_active_mentor() from anon, public;
revoke execute on function public.is_active_mentee() from anon, public;
revoke execute on function public.switch_role(public.user_role) from anon, public;
grant execute on function public.is_active_mentor() to authenticated;
grant execute on function public.is_active_mentee() to authenticated;
grant execute on function public.switch_role(public.user_role) to authenticated;

-- 4. Règles d'accès mises à jour ------------------------------------------------
-- Un profil de mentor COMPLET est visible de tous ; un mentoré reste protégé
drop policy "profiles: lecture" on public.profiles;
create policy "profiles: lecture"
  on public.profiles for select to authenticated
  using (
    is_mentor
    or id = (select auth.uid())
    or public.has_relationship_with(id)
  );

drop policy "mentorships: demande créée par un mentoré" on public.mentorships;
create policy "mentorships: demande créée par un mentoré"
  on public.mentorships for insert to authenticated
  with check (
    mentee_id = (select auth.uid())
    and status = 'pending'
    and public.is_active_mentee()
    and exists (
      select 1 from public.profiles p
      where p.id = mentor_id and p.is_mentor and p.is_available
    )
  );

drop policy "resources: publication par un mentor" on public.resources;
create policy "resources: publication par un mentor"
  on public.resources for insert to authenticated
  with check (author_id = (select auth.uid()) and public.is_active_mentor());

drop policy "workshops: création par un mentor" on public.workshops;
create policy "workshops: création par un mentor"
  on public.workshops for insert to authenticated
  with check (host_id = (select auth.uid()) and public.is_active_mentor());

-- 5. Restitution : rôle tenu DANS le mentorat, chiffres par profil complet --------
create or replace function public.get_public_testimonials(p_limit integer default 6)
returns table (first_name text, role public.user_role, domain_name text, content text, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select split_part(p.full_name, ' ', 1),
         (case when t.author_id = m.mentor_id then 'mentor' else 'mentee' end)::public.user_role,
         d.name, t.content, t.created_at
  from public.mentorship_testimonials t
  join public.profiles p on p.id = t.author_id
  join public.mentorships m on m.id = t.mentorship_id
  left join public.domains d on d.id = m.domain_id
  where t.is_public
  order by t.created_at desc
  limit least(greatest(p_limit, 1), 20);
$$;

create or replace function public.get_platform_impact()
returns table (
  mentors integer, mentees integer, mentorships integer, sessions_held integer,
  goals_done integer, avg_rating numeric, reviews integer, workshops_held integer, testimonials integer
)
language sql stable security definer set search_path = ''
as $$
  select
    (select count(*)::integer from public.profiles where is_mentor),
    (select count(*)::integer from public.profiles where is_mentee),
    (select count(*)::integer from public.mentorships where status in ('accepted', 'ended')),
    (select count(*)::integer from public.sessions where status <> 'cancelled' and scheduled_at < now()),
    (select count(*)::integer from public.goals where status = 'done'),
    (select round(avg(rating)::numeric, 1) from public.session_reviews),
    (select count(*)::integer from public.session_reviews),
    (select count(*)::integer from public.workshops where not cancelled and scheduled_at < now()),
    (select count(*)::integer from public.mentorship_testimonials where is_public);
$$;
