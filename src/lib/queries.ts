import { supabase } from '../lib/supabase';
import type { Song, Album, Artist, Genre, Playlist } from '../types';

export async function fetchSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*, artist:artists(*), album:albums(*), genre:genres(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Song[];
}

export async function fetchSongById(id: string): Promise<Song | null> {
  const { data, error } = await supabase
    .from('songs')
    .select('*, artist:artists(*), album:albums(*), genre:genres(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Song | null;
}

export async function fetchAlbums(): Promise<Album[]> {
  const { data, error } = await supabase
    .from('albums')
    .select('*, artist:artists(*), songs:songs(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Album[];
}

export async function fetchAlbumById(id: string): Promise<Album | null> {
  const { data, error } = await supabase
    .from('albums')
    .select('*, artist:artists(*), songs:songs(*, artist:artists(*), genre:genres(*))')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Album | null;
}

export async function fetchArtists(): Promise<Artist[]> {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('monthly_listeners', { ascending: false });
  if (error) throw error;
  return (data || []) as Artist[];
}

export async function fetchArtistById(id: string): Promise<Artist | null> {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Artist | null;
}

export async function fetchArtistSongs(artistId: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*, artist:artists(*), album:albums(*), genre:genres(*)')
    .eq('artist_id', artistId)
    .order('play_count', { ascending: false });
  if (error) throw error;
  return (data || []) as Song[];
}

export async function fetchArtistAlbums(artistId: string): Promise<Album[]> {
  const { data, error } = await supabase
    .from('albums')
    .select('*, artist:artists(*)')
    .eq('artist_id', artistId)
    .order('release_date', { ascending: false });
  if (error) throw error;
  return (data || []) as Album[];
}

export async function fetchGenres(): Promise<Genre[]> {
  const { data, error } = await supabase.from('genres').select('*').order('name');
  if (error) throw error;
  return (data || []) as Genre[];
}

export async function fetchGenreSongs(genreId: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*, artist:artists(*), album:albums(*), genre:genres(*)')
    .eq('genre_id', genreId)
    .order('play_count', { ascending: false });
  if (error) throw error;
  return (data || []) as Song[];
}

export async function fetchTrendingSongs(limit = 10): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*, artist:artists(*), album:albums(*), genre:genres(*)')
    .order('play_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as Song[];
}

export async function fetchRecentSongs(limit = 10): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*, artist:artists(*), album:albums(*), genre:genres(*)')
    .order('release_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as Song[];
}

export async function searchAll(query: string) {
  if (!query.trim()) return { songs: [], artists: [], albums: [], genres: [], playlists: [] };
  const [songsRes, artistsRes, albumsRes, genresRes] = await Promise.all([
    supabase
      .from('songs')
      .select('*, artist:artists(*), album:albums(*), genre:genres(*)')
      .ilike('title', `%${query}%`)
      .limit(10),
    supabase.from('artists').select('*').ilike('name', `%${query}%`).limit(10),
    supabase
      .from('albums')
      .select('*, artist:artists(*)')
      .ilike('title', `%${query}%`)
      .limit(10),
    supabase.from('genres').select('*').ilike('name', `%${query}%`).limit(10),
  ]);
  return {
    songs: (songsRes.data || []) as Song[],
    artists: (artistsRes.data || []) as Artist[],
    albums: (albumsRes.data || []) as Album[],
    genres: (genresRes.data || []) as Genre[],
    playlists: [] as Playlist[],
  };
}

// Playlist operations
export async function fetchUserPlaylists(userId: string): Promise<Playlist[]> {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Playlist[];
}

export async function fetchPlaylistById(id: string): Promise<Playlist | null> {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Playlist | null;
}

export async function fetchPlaylistSongs(playlistId: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from('playlist_songs')
    .select('*, song:songs(*, artist:artists(*), album:albums(*), genre:genres(*))')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true });
  if (error) throw error;
  return (data || []).map((ps: any) => ps.song) as Song[];
}

export async function createPlaylist(name: string, userId: string): Promise<Playlist | null> {
  const { data, error } = await supabase
    .from('playlists')
    .insert({ name, user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data as Playlist;
}

export async function updatePlaylist(
  id: string,
  updates: Partial<Playlist>
): Promise<void> {
  const { error } = await supabase.from('playlists').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deletePlaylist(id: string): Promise<void> {
  const { error } = await supabase.from('playlists').delete().eq('id', id);
  if (error) throw error;
}

export async function addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
  // Get current max position
  const { data } = await supabase
    .from('playlist_songs')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = data ? (data as any).position + 1 : 0;
  const { error } = await supabase.from('playlist_songs').insert({
    playlist_id: playlistId,
    song_id: songId,
    position: nextPosition,
  });
  if (error) throw error;
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
  const { error } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('song_id', songId);
  if (error) throw error;
}

// Recently played
export async function fetchRecentlyPlayed(userId: string, limit = 20): Promise<Song[]> {
  const { data, error } = await supabase
    .from('recently_played')
    .select('*, song:songs(*, artist:artists(*), album:albums(*), genre:genres(*))')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const seen = new Set<string>();
  return (data || [])
    .map((rp: any) => rp.song)
    .filter((song: Song) => {
      if (seen.has(song.id)) return false;
      seen.add(song.id);
      return true;
    }) as Song[];
}

// Favorites
export async function fetchFavoriteSongs(userId: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, song:songs(*, artist:artists(*), album:albums(*), genre:genres(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((f: any) => f.song) as Song[];
}

// Stats
export async function fetchUserStats(userId: string) {
  const [favCount, playlistCount, recentlyCount] = await Promise.all([
    supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('playlists').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('recently_played').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);
  return {
    favorites: favCount.count || 0,
    playlists: playlistCount.count || 0,
    recentlyPlayed: recentlyCount.count || 0,
  };
}
