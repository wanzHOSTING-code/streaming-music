export type Artist = {
  id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  monthly_listeners: number;
  created_at: string;
};

export type Genre = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  color: string;
  created_at: string;
};

export type Album = {
  id: string;
  title: string;
  artist_id: string | null;
  cover_url: string | null;
  release_date: string | null;
  description: string | null;
  created_at: string;
  artist?: Artist | null;
  songs?: Song[];
};

export type Song = {
  id: string;
  title: string;
  artist_id: string | null;
  album_id: string | null;
  genre_id: string | null;
  audio_url: string;
  cover_url: string | null;
  duration: number;
  lyrics: string | null;
  release_date: string | null;
  description: string | null;
  play_count: number;
  created_at: string;
  artist?: Artist | null;
  album?: Album | null;
  genre?: Genre | null;
};

export type Playlist = {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  cover_url: string | null;
  is_favorite: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  song_count?: number;
  songs?: Song[];
};

export type PlaylistSong = {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  added_at: string;
  song?: Song;
};

export type Favorite = {
  id: string;
  user_id: string;
  song_id: string;
  created_at: string;
  song?: Song;
};

export type RecentlyPlayed = {
  id: string;
  user_id: string;
  song_id: string;
  played_at: string;
  play_count: number;
  song?: Song;
};

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type RepeatMode = 'off' | 'all' | 'one';
export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;
