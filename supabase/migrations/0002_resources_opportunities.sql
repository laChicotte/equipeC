-- =============================================================================
-- MentorConnect — Migration 0002 : bibliothèque de ressources et opportunités
-- (TDR §7.2). À exécuter UNE fois, APRÈS 0001, dans Supabase > SQL Editor.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Types
-- -----------------------------------------------------------------------------
create type public.resource_kind as enum ('guide', 'article', 'video', 'outil', 'modele', 'formation');
create type public.opportunity_kind as enum (
  'emploi', 'stage', 'bourse', 'financement', 'concours', 'formation', 'evenement'
);

-- -----------------------------------------------------------------------------
-- 2. Tables
-- -----------------------------------------------------------------------------

-- Bibliothèque de ressources et de conseils (publiées par les mentors)
create table public.resources (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles (id) on delete cascade,
  domain_id   smallint references public.domains (id) on delete set null,
  kind        public.resource_kind not null,
  title       text not null check (char_length(title) between 3 and 150),
  description text not null check (char_length(description) between 10 and 1000),
  -- Lien facultatif, https uniquement (pas de lien javascript: ou data:)
  url         text check (url ~ '^https://[^\s]+$' and char_length(url) <= 500),
  created_at  timestamptz not null default now()
);
create index resources_domain_idx on public.resources (domain_id, created_at desc);

-- Opportunités professionnelles et entrepreneuriales (partagées par tous)
create table public.opportunities (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles (id) on delete cascade,
  kind         public.opportunity_kind not null,
  title        text not null check (char_length(title) between 3 and 150),
  organization text check (char_length(organization) <= 120),
  location     text check (char_length(location) <= 80),
  description  text not null check (char_length(description) between 10 and 1500),
  url          text check (url ~ '^https://[^\s]+$' and char_length(url) <= 500),
  deadline     date,
  created_at   timestamptz not null default now()
);
create index opportunities_deadline_idx on public.opportunities (deadline);

-- Aucune modification après publication (on supprime et on republie)
revoke update on public.resources, public.opportunities from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. Règles de sécurité (RLS)
-- -----------------------------------------------------------------------------
alter table public.resources     enable row level security;
alter table public.opportunities enable row level security;

-- Ressources : lecture par tout utilisateur connecté, publication par les mentors
create policy "resources: lecture"
  on public.resources for select to authenticated
  using (true);

create policy "resources: publication par un mentor"
  on public.resources for insert to authenticated
  with check (author_id = (select auth.uid()) and public.my_role() = 'mentor');

create policy "resources: suppression par l'auteur"
  on public.resources for delete to authenticated
  using (author_id = (select auth.uid()));

-- Opportunités : lecture et partage par tout utilisateur connecté
create policy "opportunities: lecture"
  on public.opportunities for select to authenticated
  using (true);

create policy "opportunities: partage"
  on public.opportunities for insert to authenticated
  with check (author_id = (select auth.uid()));

create policy "opportunities: suppression par l'auteur"
  on public.opportunities for delete to authenticated
  using (author_id = (select auth.uid()));
