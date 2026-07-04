import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { fetchGenres, fetchGenreSongs } from '../lib/queries';
import { usePlayerStore } from '../store/playerStore';
import { SongRow } from '../components/SongRow';
import { SkeletonRow } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import type { Genre, Song } from '../types';

export function GenrePage() {
  const { id } = useParams();
  const { currentSong, isPlaying, playQueue, togglePlay } = usePlayerStore();
  const [genre, setGenre] = useState<Genre | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchGenres(), fetchGenreSongs(id)])
      .then(([genres, s]) => {
        setGenre(genres.find((g) => g.id === id) || null);
        setSongs(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}</div>;
  if (!genre) return <EmptyState title="Genre not found" icon={<Play className="w-8 h-8" />} />;

  const isPlayingGenre = songs.some((s) => s.id === currentSong?.id) && isPlaying;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-6 flex items-end p-6" style={{ background: genre.color || '#1DB954' }}>
        <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">{genre.name}</h1>
      </div>

      {genre.description && <p className="text-gray-300 mb-6">{genre.description}</p>}

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => (isPlayingGenre ? togglePlay() : playQueue(songs))}
          className="w-14 h-14 rounded-full bg-accent flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlayingGenre ? <Pause className="w-6 h-6 text-black fill-black" /> : <Play className="w-6 h-6 text-black fill-black ml-1" />}
        </button>
      </div>

      {songs.length === 0 ? (
        <EmptyState icon={<Play className="w-8 h-8" />} title="No songs in this genre" />
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
