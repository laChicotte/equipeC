-- =============================================================================
-- MentorConnect — Migration 0004
--   Compétences précises du profil (TDR §7.2 : mise en relation selon les
--   compétences ET les besoins).
--     - mentor  : compétences qu'il peut transmettre (ex. « Business plan »)
--     - mentoré : besoins précis (ex. « Lettre de motivation »)
--   Elles complètent les 7 grands domaines et nourrissent le score de
--   compatibilité et la recherche.
-- À exécuter UNE fois, APRÈS 0001, 0002 et 0003, dans Supabase > SQL Editor.
-- =============================================================================

alter table public.profiles
  add column if not exists skills text[] not null default '{}'
    check (
      cardinality(skills) <= 10
      and char_length(array_to_string(skills, '|')) <= 500
    );

-- L'utilisateur peut modifier ses propres compétences (la RLS limite déjà
-- la modification à sa propre ligne ; ici on autorise la colonne).
grant update (skills) on public.profiles to authenticated;
