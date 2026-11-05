-- =============================================================================
-- MentorConnect — Migration 0005
--   Déroulement du programme (TDR) :
--   1. Étape 4 « ateliers thématiques » : un mentor organise un atelier
--      collectif en visio (places limitées), les participants s'inscrivent.
--   2. Étape 7 « restitution des expériences de mentorat » : bilan rédigé à la
--      fin d'un mentorat (témoignage public si son auteur l'accepte) et
--      chiffres d'impact agrégés de la plateforme.
-- À exécuter UNE fois, APRÈS 0001 à 0004, dans Supabase > SQL Editor.
-- =============================================================================

-- 1. Ateliers thématiques -------------------------------------------------------
create table public.workshops (
  id            uuid primary key default gen_random_uuid(),
  host_id       uuid not null references public.profiles (id) on delete cascade,
  domain_id     smallint references public.domains (id) on delete set null,
  title         text not null check (char_length(title) between 3 and 120),
  description   text not null check (char_length(description) between 10 and 1000),
  scheduled_at  timestamptz not null,
  duration_min  smallint not null default 60 check (duration_min between 30 and 240),
  capacity      smallint not null default 20 check (capacity between 2 and 100),
  -- Salle de visio générée par la base (jamais fournie par le navigateur)
  meeting_url   text not null default
    'https://meet.jit.si/MentorConnect-Atelier-' || replace(gen_random_uuid()::text, '-', ''),
  cancelled     boolean not null default false,
  created_at    timestamptz not null default now()
);
create index workshops_scheduled_idx on public.workshops (scheduled_at);

create table public.workshop_registrations (
  workshop_id    uuid not null references public.workshops (id) on delete cascade,
  participant_id uuid not null references public.profiles (id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (workshop_id, participant_id)
);
create index workshop_registrations_participant_idx on public.workshop_registrations (participant_id);

-- Inscription : atelier à venir, non annulé, pas son propre atelier, places
-- restantes. Le verrou (for update) évite de dépasser la capacité quand deux
-- personnes s'inscrivent au même instant.
create function public.check_workshop_registration()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  w public.workshops%rowtype;
  taken integer;
begin
  select * into w from public.workshops where id = new.workshop_id for update;
  if not found then raise exception 'Atelier introuvable'; end if;
  if w.cancelled then raise exception 'Atelier annulé'; end if;
  if w.scheduled_at <= now() then raise exception 'Atelier déjà commencé ou passé'; end if;
  if w.host_id = new.participant_id then raise exception 'Vous animez cet atelier'; end if;
  select count(*) into taken from public.workshop_registrations where workshop_id = w.id;
  if taken >= w.capacity then raise exception 'Atelier complet'; end if;
  return new;
end;
$$;

create trigger workshop_registrations_check
  before insert on public.workshop_registrations
  for each row execute function public.check_workshop_registration();

-- Le lien de visio n'est lisible que par l'animateur et les inscrits :
-- on n'accorde pas la colonne meeting_url en lecture, on passe par une fonction.
revoke all on public.workshops from anon, authenticated;
grant select (id, host_id, domain_id, title, description, scheduled_at, duration_min, capacity, cancelled, created_at)
  on public.workshops to authenticated;
grant insert (host_id, domain_id, title, description, scheduled_at, duration_min, capacity)
  on public.workshops to authenticated;
grant update (domain_id, title, description, scheduled_at, duration_min, capacity, cancelled)
  on public.workshops to authenticated;

revoke all on public.workshop_registrations from anon, authenticated;
grant select, insert, delete on public.workshop_registrations to authenticated;

alter table public.workshops enable row level security;
alter table public.workshop_registrations enable row level security;

create policy "workshops: lecture par les membres"
  on public.workshops for select to authenticated using (true);

create policy "workshops: création par un mentor"
  on public.workshops for insert to authenticated
  with check (host_id = (select auth.uid()) and public.my_role() = 'mentor');

create policy "workshops: modification par l'animateur"
  on public.workshops for update to authenticated
  using (host_id = (select auth.uid()))
  with check (host_id = (select auth.uid()));

create policy "workshop_registrations: lecture de ses inscriptions ou par l'animateur"
  on public.workshop_registrations for select to authenticated
  using (
    participant_id = (select auth.uid())
    or exists (select 1 from public.workshops w where w.id = workshop_id and w.host_id = (select auth.uid()))
  );

create policy "workshop_registrations: inscription pour soi-même"
  on public.workshop_registrations for insert to authenticated
  with check (participant_id = (select auth.uid()));

create policy "workshop_registrations: désinscription de soi-même"
  on public.workshop_registrations for delete to authenticated
  using (participant_id = (select auth.uid()));

-- Nombre d'inscrits par atelier (les inscriptions des autres restent privées)
create function public.get_workshop_counts()
returns table (workshop_id uuid, registered integer)
language sql stable security definer set search_path = ''
as $$
  select workshop_id, count(*)::integer from public.workshop_registrations group by workshop_id;
$$;

-- Lien de visio : uniquement pour l'animateur et les inscrits
create function public.get_workshop_link(p_workshop_id uuid)
returns text
language sql stable security definer set search_path = ''
as $$
  select w.meeting_url from public.workshops w
  where w.id = p_workshop_id
    and not w.cancelled
    and (
      w.host_id = (select auth.uid())
      or exists (
        select 1 from public.workshop_registrations r
        where r.workshop_id = w.id and r.participant_id = (select auth.uid())
      )
    );
$$;

-- Prénoms des inscrits : uniquement pour l'animateur (protection des mentorés)
create function public.get_workshop_participants(p_workshop_id uuid)
returns table (first_name text)
language sql stable security definer set search_path = ''
as $$
  select split_part(p.full_name, ' ', 1)
  from public.workshop_registrations r
  join public.profiles p on p.id = r.participant_id
  join public.workshops w on w.id = r.workshop_id
  where r.workshop_id = p_workshop_id and w.host_id = (select auth.uid())
  order by r.created_at;
$$;

-- 2. Restitution : bilans de fin de mentorat ---------------------------------------
create table public.mentorship_testimonials (
  id            uuid primary key default gen_random_uuid(),
  mentorship_id uuid not null references public.mentorships (id) on delete cascade,
  author_id     uuid not null references public.profiles (id) on delete cascade,
  content       text not null check (char_length(content) between 20 and 1000),
  is_public     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (mentorship_id, author_id)
);

create trigger mentorship_testimonials_updated_at before update on public.mentorship_testimonials
  for each row execute function public.set_updated_at();

revoke all on public.mentorship_testimonials from anon, authenticated;
grant select on public.mentorship_testimonials to authenticated;
grant insert (mentorship_id, author_id, content, is_public) on public.mentorship_testimonials to authenticated;
grant update (content, is_public) on public.mentorship_testimonials to authenticated;

alter table public.mentorship_testimonials enable row level security;

create policy "testimonials: lecture par les membres du mentorat"
  on public.mentorship_testimonials for select to authenticated
  using (public.is_mentorship_member(mentorship_id));

-- Un bilan se rédige une fois le mentorat terminé, par l'un de ses deux membres
create policy "testimonials: rédaction à la fin du mentorat"
  on public.mentorship_testimonials for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.mentorships m
      where m.id = mentorship_id
        and m.status = 'ended'
        and (select auth.uid()) in (m.mentor_id, m.mentee_id)
    )
  );

create policy "testimonials: modification par son auteur"
  on public.mentorship_testimonials for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

-- Témoignages publics : prénom, rôle et domaine uniquement
create function public.get_public_testimonials(p_limit integer default 6)
returns table (first_name text, role public.user_role, domain_name text, content text, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select split_part(p.full_name, ' ', 1), p.role, d.name, t.content, t.created_at
  from public.mentorship_testimonials t
  join public.profiles p on p.id = t.author_id
  join public.mentorships m on m.id = t.mentorship_id
  left join public.domains d on d.id = m.domain_id
  where t.is_public
  order by t.created_at desc
  limit least(greatest(p_limit, 1), 20);
$$;

-- 3. Chiffres d'impact (agrégats uniquement, aucune donnée personnelle) ----------
create function public.get_platform_impact()
returns table (
  mentors integer, mentees integer, mentorships integer, sessions_held integer,
  goals_done integer, avg_rating numeric, reviews integer, workshops_held integer, testimonials integer
)
language sql stable security definer set search_path = ''
as $$
  select
    (select count(*)::integer from public.profiles where role = 'mentor' and onboarded),
    (select count(*)::integer from public.profiles where role = 'mentee' and onboarded),
    (select count(*)::integer from public.mentorships where status in ('accepted', 'ended')),
    (select count(*)::integer from public.sessions where status <> 'cancelled' and scheduled_at < now()),
    (select count(*)::integer from public.goals where status = 'done'),
    (select round(avg(rating)::numeric, 1) from public.session_reviews),
    (select count(*)::integer from public.session_reviews),
    (select count(*)::integer from public.workshops where not cancelled and scheduled_at < now()),
    (select count(*)::integer from public.mentorship_testimonials where is_public);
$$;

revoke execute on function public.check_workshop_registration() from anon, public;
revoke execute on function public.get_workshop_counts() from anon, public;
revoke execute on function public.get_workshop_link(uuid) from anon, public;
revoke execute on function public.get_workshop_participants(uuid) from anon, public;
revoke execute on function public.get_public_testimonials(integer) from anon, public;
revoke execute on function public.get_platform_impact() from anon, public;
grant execute on function public.get_workshop_counts() to authenticated;
grant execute on function public.get_workshop_link(uuid) to authenticated;
grant execute on function public.get_workshop_participants(uuid) to authenticated;
grant execute on function public.get_public_testimonials(integer) to authenticated;
grant execute on function public.get_platform_impact() to authenticated;
