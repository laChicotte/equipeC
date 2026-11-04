-- =============================================================================
-- MentorConnect — Migration 0001 : schéma initial, sécurité (RLS), trigger
-- À exécuter UNE fois dans Supabase : Dashboard > SQL Editor > New query > Run
-- =============================================================================
-- Principe de sécurité : RLS est activé sur TOUTES les tables. Sans règle
-- (policy) explicite, l'accès est refusé. Chaque règle ci-dessous ouvre
-- uniquement le strict nécessaire.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Types énumérés (valeurs autorisées)
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('mentor', 'mentee');
create type public.mentee_status as enum (
  'etudiant', 'jeune_diplome', 'entrepreneur', 'porteur_projet', 'reconversion', 'autre'
);
create type public.mentorship_status as enum ('pending', 'accepted', 'declined', 'ended');
create type public.session_status as enum ('scheduled', 'done', 'cancelled');
create type public.goal_status as enum ('todo', 'in_progress', 'done');

-- -----------------------------------------------------------------------------
-- 2. Tables
-- -----------------------------------------------------------------------------

-- Catalogue des domaines d'expertise (§5 des TDR)
create table public.domains (
  id          smallint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  description text
);

-- Un profil par utilisateur (créé automatiquement à l'inscription, cf. trigger)
create table public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  role             public.user_role not null,
  full_name        text not null check (char_length(full_name) between 1 and 100),
  headline         text check (char_length(headline) <= 120),
  bio              text check (char_length(bio) <= 2000),
  city             text check (char_length(city) <= 80),
  avatar_url       text check (char_length(avatar_url) <= 500),
  -- Champs utilisés par les mentors
  job_title        text check (char_length(job_title) <= 120),
  organization     text check (char_length(organization) <= 120),
  years_experience smallint check (years_experience between 0 and 60),
  availability     text check (char_length(availability) <= 300),
  is_available     boolean not null default true,
  -- Champs utilisés par les mentorés
  mentee_status    public.mentee_status,
  goals_summary    text check (char_length(goals_summary) <= 1000),
  -- Profil complété (onboarding terminé)
  onboarded        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Expertises (mentor) ou centres d'intérêt (mentoré)
create table public.profile_domains (
  profile_id uuid     not null references public.profiles (id) on delete cascade,
  domain_id  smallint not null references public.domains (id) on delete cascade,
  primary key (profile_id, domain_id)
);
create index profile_domains_domain_idx on public.profile_domains (domain_id);

-- Demande puis relation de mentorat
create table public.mentorships (
  id           uuid primary key default gen_random_uuid(),
  mentor_id    uuid not null references public.profiles (id) on delete cascade,
  mentee_id    uuid not null references public.profiles (id) on delete cascade,
  domain_id    smallint references public.domains (id) on delete set null,
  message      text check (char_length(message) <= 1000),
  status       public.mentorship_status not null default 'pending',
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  check (mentor_id <> mentee_id)
);
-- Une seule demande "active" (en attente ou acceptée) par couple mentor/mentoré
create unique index mentorships_one_active_per_pair
  on public.mentorships (mentor_id, mentee_id)
  where status in ('pending', 'accepted');
create index mentorships_mentee_idx on public.mentorships (mentee_id);

-- Messages du chat (dans une relation de mentorat)
create table public.messages (
  id            bigint generated always as identity primary key,
  mentorship_id uuid not null references public.mentorships (id) on delete cascade,
  sender_id     uuid not null references public.profiles (id) on delete cascade,
  content       text not null check (char_length(content) between 1 and 2000),
  created_at    timestamptz not null default now()
);
create index messages_mentorship_idx on public.messages (mentorship_id, created_at);

-- Séances planifiées (visio)
create table public.sessions (
  id            uuid primary key default gen_random_uuid(),
  mentorship_id uuid not null references public.mentorships (id) on delete cascade,
  scheduled_at  timestamptz not null,
  duration_min  smallint not null default 60 check (duration_min between 15 and 240),
  topic         text check (char_length(topic) <= 200),
  -- Lien de salle généré par la base (imprévisible, non modifiable par l'utilisateur)
  meeting_url   text not null default
    'https://meet.jit.si/MentorConnect-' || replace(gen_random_uuid()::text, '-', ''),
  status        public.session_status not null default 'scheduled',
  created_by    uuid not null references public.profiles (id) on delete cascade,
  created_at    timestamptz not null default now()
);
create index sessions_mentorship_idx on public.sessions (mentorship_id, scheduled_at);

-- Évaluation d'une séance (une par participant et par séance)
create table public.session_reviews (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text check (char_length(comment) <= 1000),
  created_at  timestamptz not null default now(),
  unique (session_id, reviewer_id)
);

-- Objectifs et progression
create table public.goals (
  id            uuid primary key default gen_random_uuid(),
  mentorship_id uuid not null references public.mentorships (id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 200),
  status        public.goal_status not null default 'todo',
  due_date      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index goals_mentorship_idx on public.goals (mentorship_id);

-- -----------------------------------------------------------------------------
-- 3. Fonctions utilitaires pour les règles de sécurité
--    "security definer" : s'exécutent avec les droits du propriétaire, ce qui
--    évite les boucles infinies entre règles RLS. Elles ne renvoient qu'un
--    booléen concernant l'utilisateur connecté : aucune fuite de données.
--    "set search_path = ''" : protection contre le détournement de schéma.
-- -----------------------------------------------------------------------------
create function public.my_role()
returns public.user_role
language sql stable security definer set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create function public.is_mentorship_member(p_mentorship_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.mentorships m
    where m.id = p_mentorship_id
      and (select auth.uid()) in (m.mentor_id, m.mentee_id)
  );
$$;

create function public.is_active_mentorship_member(p_mentorship_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.mentorships m
    where m.id = p_mentorship_id
      and m.status = 'accepted'
      and (select auth.uid()) in (m.mentor_id, m.mentee_id)
  );
$$;

-- Vrai si l'utilisateur connecté a (ou a eu) une relation avec ce profil
create function public.has_relationship_with(p_profile_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.mentorships m
    where (m.mentor_id = (select auth.uid()) and m.mentee_id = p_profile_id)
       or (m.mentee_id = (select auth.uid()) and m.mentor_id = p_profile_id)
  );
$$;

-- Note moyenne publique des mentors (calculée sur les avis des mentorés)
create function public.get_mentor_ratings()
returns table (mentor_id uuid, avg_rating numeric, reviews_count bigint)
language sql stable security definer set search_path = ''
as $$
  select m.mentor_id, round(avg(r.rating), 1), count(*)
  from public.session_reviews r
  join public.sessions s on s.id = r.session_id
  join public.mentorships m on m.id = s.mentorship_id
  where r.reviewer_id = m.mentee_id
  group by m.mentor_id;
$$;

-- Les visiteurs non connectés n'ont pas à appeler ces fonctions
revoke execute on function public.my_role() from anon, public;
revoke execute on function public.is_mentorship_member(uuid) from anon, public;
revoke execute on function public.is_active_mentorship_member(uuid) from anon, public;
revoke execute on function public.has_relationship_with(uuid) from anon, public;
revoke execute on function public.get_mentor_ratings() from anon, public;
grant execute on function public.my_role() to authenticated;
grant execute on function public.is_mentorship_member(uuid) to authenticated;
grant execute on function public.is_active_mentorship_member(uuid) to authenticated;
grant execute on function public.has_relationship_with(uuid) to authenticated;
grant execute on function public.get_mentor_ratings() to authenticated;

-- -----------------------------------------------------------------------------
-- 4. Triggers
-- -----------------------------------------------------------------------------

-- 4.1 Création automatique du profil à l'inscription.
-- Le rôle vient des métadonnées envoyées par le formulaire : c'est une donnée
-- fournie par l'utilisateur, donc on n'accepte QUE 'mentor' ou 'mentee'.
create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    case new.raw_user_meta_data ->> 'role'
      when 'mentor' then 'mentor'::public.user_role
      else 'mentee'::public.user_role
    end,
    left(coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    ), 100)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4.2 Mise à jour automatique de updated_at
create function public.set_updated_at()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger goals_updated_at before update on public.goals
  for each row execute function public.set_updated_at();

-- 4.3 Règles de transition du statut d'un mentorat
--   pending  -> accepted | declined : uniquement le mentor
--   accepted -> ended               : l'un ou l'autre participant
create function public.check_mentorship_transition()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if old.status = 'pending' and new.status in ('accepted', 'declined') then
    -- auth.uid() est nul uniquement pour l'administration (SQL Editor, script
    -- de démo avec la clé secrète) : les visiteurs anonymes n'ont aucun droit
    -- de modification sur cette table.
    if (select auth.uid()) is not null
       and (select auth.uid()) is distinct from old.mentor_id then
      raise exception 'Seul le mentor peut répondre à cette demande';
    end if;
    new.responded_at = now();
  elsif old.status = 'accepted' and new.status = 'ended' then
    null; -- autorisé pour les deux participants (déjà vérifié par RLS)
  else
    raise exception 'Transition de statut interdite : % -> %', old.status, new.status;
  end if;

  return new;
end;
$$;

create trigger mentorships_status_transition before update on public.mentorships
  for each row execute function public.check_mentorship_transition();

-- -----------------------------------------------------------------------------
-- 5. Droits par colonne
--    Même si RLS autorise la modification d'une ligne, on limite les colonnes
--    modifiables (ex. : impossible de changer son propre rôle).
-- -----------------------------------------------------------------------------
revoke update on public.profiles from anon, authenticated;
grant update (
  full_name, headline, bio, city, avatar_url,
  job_title, organization, years_experience, availability, is_available,
  mentee_status, goals_summary, onboarded
) on public.profiles to authenticated;

revoke update on public.mentorships from anon, authenticated;
grant update (status) on public.mentorships to authenticated;

revoke insert, update on public.sessions from anon, authenticated;
grant insert (mentorship_id, scheduled_at, duration_min, topic, created_by)
  on public.sessions to authenticated;
grant update (scheduled_at, duration_min, topic, status)
  on public.sessions to authenticated;

revoke update on public.messages, public.session_reviews from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6. Row Level Security (RLS)
-- -----------------------------------------------------------------------------
alter table public.domains         enable row level security;
alter table public.profiles        enable row level security;
alter table public.profile_domains enable row level security;
alter table public.mentorships     enable row level security;
alter table public.messages        enable row level security;
alter table public.sessions        enable row level security;
alter table public.session_reviews enable row level security;
alter table public.goals           enable row level security;

-- domains : lecture publique (page d'accueil), aucune écriture
create policy "domains: lecture publique"
  on public.domains for select to anon, authenticated
  using (true);

-- profiles : les mentors sont visibles par tout utilisateur connecté ;
-- un mentoré n'est visible que par lui-même et par ses mentors (protection des jeunes)
create policy "profiles: lecture"
  on public.profiles for select to authenticated
  using (
    role = 'mentor'
    or id = (select auth.uid())
    or public.has_relationship_with(id)
  );

create policy "profiles: modification de son propre profil"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- profile_domains : visible si le profil est visible ; modifiable par soi-même
create policy "profile_domains: lecture"
  on public.profile_domains for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id));

create policy "profile_domains: ajout pour soi"
  on public.profile_domains for insert to authenticated
  with check (profile_id = (select auth.uid()));

create policy "profile_domains: suppression pour soi"
  on public.profile_domains for delete to authenticated
  using (profile_id = (select auth.uid()));

-- mentorships
create policy "mentorships: lecture par les participants"
  on public.mentorships for select to authenticated
  using ((select auth.uid()) in (mentor_id, mentee_id));

create policy "mentorships: demande créée par un mentoré"
  on public.mentorships for insert to authenticated
  with check (
    mentee_id = (select auth.uid())
    and status = 'pending'
    and public.my_role() = 'mentee'
    and exists (
      select 1 from public.profiles p
      where p.id = mentor_id and p.role = 'mentor' and p.is_available
    )
  );

create policy "mentorships: mise à jour par les participants"
  on public.mentorships for update to authenticated
  using ((select auth.uid()) in (mentor_id, mentee_id))
  with check ((select auth.uid()) in (mentor_id, mentee_id));

-- messages : lecture par les participants, envoi seulement si relation acceptée
create policy "messages: lecture par les participants"
  on public.messages for select to authenticated
  using (public.is_mentorship_member(mentorship_id));

create policy "messages: envoi dans une relation acceptée"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.is_active_mentorship_member(mentorship_id)
  );

-- sessions
create policy "sessions: lecture par les participants"
  on public.sessions for select to authenticated
  using (public.is_mentorship_member(mentorship_id));

create policy "sessions: création dans une relation acceptée"
  on public.sessions for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and public.is_active_mentorship_member(mentorship_id)
  );

create policy "sessions: mise à jour par les participants"
  on public.sessions for update to authenticated
  using (public.is_mentorship_member(mentorship_id))
  with check (public.is_mentorship_member(mentorship_id));

-- session_reviews : visibles par les participants, une note par séance passée
create policy "session_reviews: lecture par les participants"
  on public.session_reviews for select to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id));

create policy "session_reviews: évaluation d'une séance passée"
  on public.session_reviews for insert to authenticated
  with check (
    reviewer_id = (select auth.uid())
    and exists (
      select 1 from public.sessions s
      where s.id = session_id
        and s.status <> 'cancelled'
        and s.scheduled_at < now()
        and public.is_mentorship_member(s.mentorship_id)
    )
  );

-- goals : gérés par les deux participants
create policy "goals: lecture par les participants"
  on public.goals for select to authenticated
  using (public.is_mentorship_member(mentorship_id));

create policy "goals: création par les participants"
  on public.goals for insert to authenticated
  with check (public.is_active_mentorship_member(mentorship_id));

create policy "goals: mise à jour par les participants"
  on public.goals for update to authenticated
  using (public.is_mentorship_member(mentorship_id))
  with check (public.is_mentorship_member(mentorship_id));

create policy "goals: suppression par les participants"
  on public.goals for delete to authenticated
  using (public.is_mentorship_member(mentorship_id));

-- -----------------------------------------------------------------------------
-- 7. Temps réel : diffuser les nouveaux messages (les règles RLS s'appliquent)
-- -----------------------------------------------------------------------------
alter publication supabase_realtime add table public.messages;

-- -----------------------------------------------------------------------------
-- 8. Données de référence : les 7 domaines du §5 des TDR
-- -----------------------------------------------------------------------------
insert into public.domains (slug, name, description) values
  ('entrepreneuriat', 'Entrepreneuriat et gestion d''entreprise',
   'Création et développement d''entreprise, structuration de projets, financement, développement commercial.'),
  ('numerique', 'Numérique et technologies',
   'Développement informatique, intelligence artificielle, cybersécurité, marketing digital, design.'),
  ('orientation-insertion', 'Orientation et insertion professionnelle',
   'Parcours professionnel, entretiens d''embauche, CV et lettres de motivation, recherche d''emploi.'),
  ('culture-creation', 'Culture, littérature et industries créatives',
   'Écriture et édition, métiers du livre, création de contenu, audiovisuel, entrepreneuriat culturel.'),
  ('gestion-finance', 'Gestion, finance et administration',
   'Comptabilité, gestion de projets, management, ressources humaines, finance.'),
  ('developpement-personnel', 'Développement personnel et leadership',
   'Prise de parole, confiance en soi, leadership, gestion du temps, relations humaines.'),
  ('campus-france', 'Accompagnement Campus France',
   'Choix des formations, projet d''études, dossier de candidature, préparation de l''entretien. Conseil uniquement : ne garantit ni admission ni visa.');
