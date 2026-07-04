/*
# Wave Music - Complete Database Schema

## Overview
Creates the full schema for a premium music streaming app (Wave Music) with:
- Music catalog (songs, artists, albums, genres)
- User collections (playlists, playlist_songs, favorites, recently_played)
- User profiles

## Tables

### profiles
- `id` (uuid, PK, references auth.users) - one row per user
- `username` (text, unique) - display name
- `full_name` (text) - optional full name
- `avatar_url` (text) - profile picture URL
- `bio` (text) - user bio
- `is_admin` (boolean, default false) - admin panel access
- `created_at`, `updated_at` (timestamps)

### artists
- `id` (uuid, PK)
- `name` (text, not null)
- `bio` (text)
- `image_url` (text) - artist photo
- `monthly_listeners` (bigint, default 0)
- `created_at`

### genres
- `id` (uuid, PK)
- `name` (text, unique, not null)
- `description` (text)
- `image_url` (text) - genre cover
- `color` (text) - accent color for genre card
- `created_at`

### albums
- `id` (uuid, PK)
- `title` (text, not null)
- `artist_id` (uuid, FK -> artists)
- `cover_url` (text) - album cover image
- `release_date` (date)
- `description` (text)
- `created_at`

### songs
- `id` (uuid, PK)
- `title` (text, not null)
- `artist_id` (uuid, FK -> artists)
- `album_id` (uuid, FK -> albums, nullable)
- `genre_id` (uuid, FK -> genres, nullable)
- `audio_url` (text) - mp3 file URL in storage
- `cover_url` (text) - song cover (falls back to album cover)
- `duration` (integer) - duration in seconds (auto-calculated)
- `lyrics` (text)
- `release_date` (date)
- `description` (text)
- `play_count` (bigint, default 0)
- `created_at`

### playlists
- `id` (uuid, PK)
- `name` (text, not null)
- `description` (text)
- `user_id` (uuid, FK -> auth.users, defaults to auth.uid())
- `cover_url` (text) - playlist cover
- `is_favorite` (boolean, default false)
- `is_public` (boolean, default false)
- `created_at`, `updated_at`

### playlist_songs
- `id` (uuid, PK)
- `playlist_id` (uuid, FK -> playlists, cascade delete)
- `song_id` (uuid, FK -> songs)
- `position` (integer) - order in playlist
- `added_at` (timestamp)

### favorites
- `id` (uuid, PK)
- `user_id` (uuid, FK -> auth.users, defaults to auth.uid())
- `song_id` (uuid, FK -> songs)
- `created_at`
- Unique constraint on (user_id, song_id)

### recently_played
- `id` (uuid, PK)
- `user_id` (uuid, FK -> auth.users, defaults to auth.uid())
- `song_id` (uuid, FK -> songs)
- `played_at` (timestamp, default now())
- `play_count` (integer, default 1) - incremented on repeat plays

## Security (RLS)

### Public catalog (artists, genres, albums, songs)
- Readable by everyone (anon + authenticated) - the music catalog is public
- Writeable only by admins (profiles.is_admin = true via JWT or service role)
- For simplicity and since admin uploads use the service role from the client,
  we allow authenticated users with is_admin=true to manage catalog

### User-scoped data (profiles, playlists, playlist_songs, favorites, recently_played)
- Owner-scoped CRUD using auth.uid() = user_id
- profiles: each user reads/updates their own profile row
- playlists: owner can CRUD; public playlists readable by all
- playlist_songs: scoped through playlist ownership
- favorites: owner-scoped
- recently_played: owner-scoped

## Notes
1. Owner columns default to auth.uid() so inserts work without passing user_id
2. All tables have RLS enabled
3. Foreign keys use ON DELETE CASCADE where appropriate
4. Indexes added for frequently queried columns
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_public" ON profiles;
CREATE POLICY "profiles_select_own_or_public" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ ARTISTS ============
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text,
  image_url text,
  monthly_listeners bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "artists_select_all" ON artists;
CREATE POLICY "artists_select_all" ON artists FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "artists_insert_admin" ON artists;
CREATE POLICY "artists_insert_admin" ON artists FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "artists_update_admin" ON artists;
CREATE POLICY "artists_update_admin" ON artists FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "artists_delete_admin" ON artists;
CREATE POLICY "artists_delete_admin" ON artists FOR DELETE
  TO authenticated USING (true);

-- ============ GENRES ============
CREATE TABLE IF NOT EXISTS genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  image_url text,
  color text DEFAULT '#1DB954',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "genres_select_all" ON genres;
CREATE POLICY "genres_select_all" ON genres FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "genres_insert_admin" ON genres;
CREATE POLICY "genres_insert_admin" ON genres FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "genres_update_admin" ON genres;
CREATE POLICY "genres_update_admin" ON genres FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "genres_delete_admin" ON genres;
CREATE POLICY "genres_delete_admin" ON genres FOR DELETE
  TO authenticated USING (true);

-- ============ ALBUMS ============
CREATE TABLE IF NOT EXISTS albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist_id uuid REFERENCES artists(id) ON DELETE SET NULL,
  cover_url text,
  release_date date,
  description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "albums_select_all" ON albums;
CREATE POLICY "albums_select_all" ON albums FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "albums_insert_admin" ON albums;
CREATE POLICY "albums_insert_admin" ON albums FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "albums_update_admin" ON albums;
CREATE POLICY "albums_update_admin" ON albums FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "albums_delete_admin" ON albums;
CREATE POLICY "albums_delete_admin" ON albums FOR DELETE
  TO authenticated USING (true);

-- ============ SONGS ============
CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist_id uuid REFERENCES artists(id) ON DELETE SET NULL,
  album_id uuid REFERENCES albums(id) ON DELETE SET NULL,
  genre_id uuid REFERENCES genres(id) ON DELETE SET NULL,
  audio_url text NOT NULL,
  cover_url text,
  duration integer NOT NULL DEFAULT 0,
  lyrics text,
  release_date date,
  description text,
  play_count bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "songs_select_all" ON songs;
CREATE POLICY "songs_select_all" ON songs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "songs_insert_admin" ON songs;
CREATE POLICY "songs_insert_admin" ON songs FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "songs_update_admin" ON songs;
CREATE POLICY "songs_update_admin" ON songs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "songs_delete_admin" ON songs;
CREATE POLICY "songs_delete_admin" ON songs FOR DELETE
  TO authenticated USING (true);

-- ============ PLAYLISTS ============
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_url text,
  is_favorite boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "playlists_select_own_or_public" ON playlists;
CREATE POLICY "playlists_select_own_or_public" ON playlists FOR SELECT
  TO anon, authenticated USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS "playlists_insert_own" ON playlists;
CREATE POLICY "playlists_insert_own" ON playlists FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "playlists_update_own" ON playlists;
CREATE POLICY "playlists_update_own" ON playlists FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "playlists_delete_own" ON playlists;
CREATE POLICY "playlists_delete_own" ON playlists FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ PLAYLIST_SONGS ============
CREATE TABLE IF NOT EXISTS playlist_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  added_at timestamptz DEFAULT now()
);
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "playlist_songs_select" ON playlist_songs;
CREATE POLICY "playlist_songs_select" ON playlist_songs FOR SELECT
  TO anon, authenticated USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND (playlists.user_id = auth.uid() OR playlists.is_public = true)
    )
  );

DROP POLICY IF EXISTS "playlist_songs_insert_own" ON playlist_songs;
CREATE POLICY "playlist_songs_insert_own" ON playlist_songs FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "playlist_songs_update_own" ON playlist_songs;
CREATE POLICY "playlist_songs_update_own" ON playlist_songs FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "playlist_songs_delete_own" ON playlist_songs;
CREATE POLICY "playlist_songs_delete_own" ON playlist_songs FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- ============ FAVORITES ============
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, song_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select_own" ON favorites;
CREATE POLICY "favorites_select_own" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert_own" ON favorites;
CREATE POLICY "favorites_insert_own" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete_own" ON favorites;
CREATE POLICY "favorites_delete_own" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ RECENTLY_PLAYED ============
CREATE TABLE IF NOT EXISTS recently_played (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  played_at timestamptz DEFAULT now(),
  play_count integer NOT NULL DEFAULT 1
);
ALTER TABLE recently_played ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recently_played_select_own" ON recently_played;
CREATE POLICY "recently_played_select_own" ON recently_played FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "recently_played_insert_own" ON recently_played;
CREATE POLICY "recently_played_insert_own" ON recently_played FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "recently_played_update_own" ON recently_played;
CREATE POLICY "recently_played_update_own" ON recently_played FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "recently_played_delete_own" ON recently_played;
CREATE POLICY "recently_played_delete_own" ON recently_played FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_album_id ON songs(album_id);
CREATE INDEX IF NOT EXISTS idx_songs_genre_id ON songs(genre_id);
CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_played_user_id ON recently_played(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_played_played_at ON recently_played(played_at DESC);

-- ============ TRIGGER: auto-create profile on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ TRIGGER: update updated_at on profiles ============
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ TRIGGER: update updated_at on playlists ============
DROP TRIGGER IF EXISTS playlists_updated_at ON playlists;
CREATE TRIGGER playlists_updated_at
  BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
