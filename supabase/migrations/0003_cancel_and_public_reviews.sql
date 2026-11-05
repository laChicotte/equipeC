-- =============================================================================
-- MentorConnect — Migration 0003
--   1. Un mentoré peut ANNULER sa demande tant qu'elle est en attente
--   2. Avis publics des mentorés sur le profil d'un mentor (TDR §7.2)
--   3. Type d'opportunité « atelier » (ateliers thématiques, TDR §10 étape 4)
-- À exécuter UNE fois, APRÈS 0001 et 0002, dans Supabase > SQL Editor.
-- =============================================================================

-- 1. Nouveaux statut et type ----------------------------------------------------
alter type public.mentorship_status add value if not exists 'cancelled';
alter type public.opportunity_kind add value if not exists 'atelier';

-- Règles de transition (remplace la version de 0001) :
--   pending  -> accepted | declined : uniquement le mentor
--   pending  -> cancelled           : uniquement le mentoré
--   accepted -> ended               : l'un ou l'autre participant
create or replace function public.check_mentorship_transition()
returns trigger
language plpgsql set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if new.status = old.status then
    return new;
  end if;

  -- uid nul = administration (SQL Editor, script de démo) : tout est permis
  if old.status = 'pending' and new.status::text in ('accepted', 'declined') then
    if uid is not null and uid is distinct from old.mentor_id then
      raise exception 'Seul le mentor peut répondre à cette demande';
    end if;
    new.responded_at = now();
  elsif old.status = 'pending' and new.status::text = 'cancelled' then
    if uid is not null and uid is distinct from old.mentee_id then
      raise exception 'Seul le mentoré peut annuler sa demande';
    end if;
    new.responded_at = now();
  elsif old.status = 'accepted' and new.status = 'ended' then
    null;
  else
    raise exception 'Transition de statut interdite : % -> %', old.status, new.status;
  end if;

  return new;
end;
$$;

-- 2. Avis publics ----------------------------------------------------------------
-- Les avis ne sont lisibles en direct que par les participants (RLS). Cette
-- fonction expose UNIQUEMENT ce qui est utile au profil public : note,
-- commentaire, date et prénom de l'auteur (jamais son nom complet ni son id).
create or replace function public.get_mentor_reviews(p_mentor_id uuid, p_limit int default 6)
returns table (rating smallint, comment text, created_at timestamptz, reviewer_first_name text)
language sql stable security definer set search_path = ''
as $$
  select r.rating, r.comment, r.created_at, split_part(p.full_name, ' ', 1)
  from public.session_reviews r
  join public.sessions s on s.id = r.session_id
  join public.mentorships m on m.id = s.mentorship_id
  join public.profiles p on p.id = r.reviewer_id
  where m.mentor_id = p_mentor_id
    and r.reviewer_id = m.mentee_id
  order by r.created_at desc
  limit least(greatest(p_limit, 1), 20);
$$;

revoke execute on function public.get_mentor_reviews(uuid, int) from anon, public;
grant execute on function public.get_mentor_reviews(uuid, int) to authenticated;
