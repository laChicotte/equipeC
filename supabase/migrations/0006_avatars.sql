-- =============================================================================
-- MentorConnect — Migration 0006
--   Photos de profil (Supabase Storage, inclus dans l'offre gratuite).
--   - Dossier « avatars », lisible publiquement (affichage des photos)
--   - 2 Mo maximum, JPEG / PNG / WebP uniquement
--   - Chaque utilisateur ne peut écrire QUE dans son dossier : avatars/<son id>/…
--   - profiles.avatar_url ne peut pointer QUE vers son propre dossier
--     (empêche d'afficher une image arbitraire hébergée ailleurs)
-- À exécuter UNE fois, APRÈS 0001 à 0005, dans Supabase > SQL Editor.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "avatars: lecture de son dossier"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: dépôt dans son dossier"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: remplacement dans son dossier"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: suppression dans son dossier"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- La photo d'un profil vient forcément de SON dossier du stockage
alter table public.profiles
  add constraint profiles_avatar_url_own_folder check (
    avatar_url is null
    or (
      avatar_url like 'https://%'
      and position('/storage/v1/object/public/avatars/' || id::text || '/' in avatar_url) > 0
    )
  );
