-- =============================================================================
-- MentorConnect — Migration 0008 : formulaires d'inscription
--   1. Atelier : niveau + attentes demandés à l'inscription (visibles par l'animateur)
--   2. Opportunité : candidature (motivation + contact) visible par l'auteur
-- À exécuter UNE fois, APRÈS 0007, dans Supabase > SQL Editor.
-- =============================================================================

-- 1. Ateliers -----------------------------------------------------------------
alter table public.workshop_registrations
  add column level        text check (level in ('debutant', 'intermediaire', 'avance')),
  add column expectations text check (char_length(expectations) <= 500);

-- L'animateur voit le prénom, le niveau et les attentes de chaque inscrit
drop function if exists public.get_workshop_participants(uuid);
create function public.get_workshop_participants(p_workshop_id uuid)
returns table (first_name text, level text, expectations text)
language sql stable security definer set search_path = ''
as $$
  select split_part(p.full_name, ' ', 1), r.level, r.expectations
  from public.workshop_registrations r
  join public.profiles p on p.id = r.participant_id
  join public.workshops w on w.id = r.workshop_id
  where r.workshop_id = p_workshop_id and w.host_id = (select auth.uid())
  order by r.created_at;
$$;

-- 2. Candidatures aux opportunités ----------------------------------------------
create table public.opportunity_applications (
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  applicant_id   uuid not null references public.profiles (id) on delete cascade,
  motivation     text not null check (char_length(motivation) between 20 and 1000),
  contact        text not null check (char_length(contact) between 5 and 120),
  created_at     timestamptz not null default now(),
  primary key (opportunity_id, applicant_id)
);
create index opportunity_applications_applicant_idx on public.opportunity_applications (applicant_id);

revoke all on public.opportunity_applications from anon, authenticated;
grant select, insert, delete on public.opportunity_applications to authenticated;
alter table public.opportunity_applications enable row level security;

create policy "opportunity_applications: lecture de ses candidatures ou par l'auteur"
  on public.opportunity_applications for select to authenticated
  using (
    applicant_id = (select auth.uid())
    or exists (select 1 from public.opportunities o where o.id = opportunity_id and o.author_id = (select auth.uid()))
  );

-- Pour soi-même, pas sur sa propre annonce, et avant la date limite
create policy "opportunity_applications: candidature pour soi-même"
  on public.opportunity_applications for insert to authenticated
  with check (
    applicant_id = (select auth.uid())
    and exists (
      select 1 from public.opportunities o
      where o.id = opportunity_id
        and o.author_id <> (select auth.uid())
        and (o.deadline is null or o.deadline >= (now() at time zone 'Africa/Conakry')::date)
    )
  );

create policy "opportunity_applications: retrait de sa candidature"
  on public.opportunity_applications for delete to authenticated
  using (applicant_id = (select auth.uid()));

-- Candidatures reçues, avec le nom complet : uniquement pour l'auteur de l'annonce
create function public.get_opportunity_applications(p_opportunity_id uuid)
returns table (full_name text, motivation text, contact text, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select p.full_name, a.motivation, a.contact, a.created_at
  from public.opportunity_applications a
  join public.profiles p on p.id = a.applicant_id
  join public.opportunities o on o.id = a.opportunity_id
  where a.opportunity_id = p_opportunity_id and o.author_id = (select auth.uid())
  order by a.created_at desc;
$$;
