/*
# Storage policies for Wave Music

## Buckets
- covers (public) - album/song/playlist cover images
- songs (public) - mp3 audio files
- avatars (public) - user profile pictures

## Policies
- All buckets: public read (anon + authenticated)
- covers/songs: authenticated can upload/update/delete (admin manages content)
- avatars: authenticated can upload/update/delete their own (simplified: authenticated can manage)
*/

-- covers bucket policies
DROP POLICY IF EXISTS "covers_select_all" ON storage.objects;
CREATE POLICY "covers_select_all" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "covers_insert_auth" ON storage.objects;
CREATE POLICY "covers_insert_auth" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'covers');

DROP POLICY IF EXISTS "covers_update_auth" ON storage.objects;
CREATE POLICY "covers_update_auth" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'covers') WITH CHECK (bucket_id = 'covers');

DROP POLICY IF EXISTS "covers_delete_auth" ON storage.objects;
CREATE POLICY "covers_delete_auth" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'covers');

-- songs bucket policies
DROP POLICY IF EXISTS "songs_select_all" ON storage.objects;
CREATE POLICY "songs_select_all" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'songs');

DROP POLICY IF EXISTS "songs_insert_auth" ON storage.objects;
CREATE POLICY "songs_insert_auth" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'songs');

DROP POLICY IF EXISTS "songs_update_auth" ON storage.objects;
CREATE POLICY "songs_update_auth" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'songs') WITH CHECK (bucket_id = 'songs');

DROP POLICY IF EXISTS "songs_delete_auth" ON storage.objects;
CREATE POLICY "songs_delete_auth" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'songs');

-- avatars bucket policies
DROP POLICY IF EXISTS "avatars_select_all" ON storage.objects;
CREATE POLICY "avatars_select_all" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert_auth" ON storage.objects;
CREATE POLICY "avatars_insert_auth" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_update_auth" ON storage.objects;
CREATE POLICY "avatars_update_auth" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_delete_auth" ON storage.objects;
CREATE POLICY "avatars_delete_auth" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'avatars');
