import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { fetchRecentlyPlayed } from '../lib/queries';
import { SongRow } from '../components/SongRow';
import { SkeletonRow } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import type { Song } from '../types';

export function RecentlyPlayedPage() {
  const { profile } = useAuthStore();
  const { currentSong, isPlaying, playQueue, togglePlay } = usePlayerStore();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    fetchRecentlyPlayed(profile.id, 50).then(setSongs).catch(() => {}).finally(() => setLoading(false));
  }, [profile?.id]);

  const isPlayingRecent = songs.some((s) => s.id === currentSong?.id) && isPlaying;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl">
          <Clock className="w-20 h-20 text-white" />
        </div>
        <div className="text-center md:text-left">
          <p className="text-sm font-semibold text-gray-300 mb-2">History</p>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Recently Played</h1>
          <p className="text-sm text-gray-300">{songs.length} songs</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => (isPlayingRecent ? togglePlay() : playQueue(songs))}
          disabled={songs.length === 0}
          className="w-14 h-14 rounded-full bg-accent flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isPlayingRecent ? <Pause className="w-6 h-6 text-black fill-black" /> : <Play className="w-6 h-6 text-black fill-black ml-1" />}
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : songs.length === 0 ? (
        <EmptyState icon={<Clock className="w-8 h-8" />} title="No listening history" description="Songs you play will appear here." />
      ) : (
        <div className="space-y-1">
          {songs.map((song, i) => (
            <SongRow key={`${song.id}-${i}`} song={song} index={i} queue={songs} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
