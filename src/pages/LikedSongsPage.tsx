import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { fetchFavoriteSongs } from '../lib/queries';
import { SongRow } from '../components/SongRow';
import { SkeletonRow } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import type { Song } from '../types';

export function LikedSongsPage() {
  const { profile } = useAuthStore();
  const { playQueue, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!profile?.id) return;
    setLoading(true);
    fetchFavoriteSongs(profile.id).then(setSongs).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [profile?.id]);

  const isPlayingLiked = songs.some((s) => s.id === currentSong?.id) && isPlaying;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-2xl">
          <Heart className="w-20 h-20 text-white fill-white" />
        </div>
        <div className="text-center md:text-left">
          <p className="text-sm font-semibold text-gray-300 mb-2">Playlist</p>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Liked Songs</h1>
          <p className="text-sm text-gray-300">{profile?.username} · {songs.length} songs</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => (isPlayingLiked ? togglePlay() : playQueue(songs))}
          disabled={songs.length === 0}
          className="w-14 h-14 rounded-full bg-accent flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isPlayingLiked ? <Heart className="w-6 h-6 text-black fill-black" /> : <Play className="w-6 h-6 text-black fill-black ml-1" />}
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : songs.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8" />}
          title="No liked songs yet"
          description="Tap the heart icon on any song to save it here."
        />
      ) : (
        <div className="space-y-1">
          {songs.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} queue={songs} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
