import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Clock } from 'lucide-react';
import { fetchAlbumById } from '../lib/queries';
import { usePlayerStore } from '../store/playerStore';
import { SongRow } from '../components/SongRow';
import { SkeletonRow } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { formatDuration, formatDate } from '../lib/utils';
import type { Album } from '../types';

export function AlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSong, isPlaying, playQueue, togglePlay } = usePlayerStore();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchAlbumById(id)
      .then(setAlbum)
      .catch(() => setAlbum(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}</div>;
  if (!album) return <EmptyState icon={<Clock className="w-8 h-8" />} title="Album not found" />;

  const songs = album.songs || [];
  const isPlayingAlbum = songs.some((s) => s.id === currentSong?.id) && isPlaying;
  const totalDuration = songs.reduce((acc, s) => acc + s.duration, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <img src={album.cover_url || ''} alt={album.title} className="w-48 h-48 md:w-56 md:h-56 rounded-2xl shadow-2xl object-cover" />
        <div className="text-center md:text-left">
          <p className="text-sm font-semibold text-gray-300 mb-2">Album</p>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{album.title}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-300">
            {album.artist && (
              <button onClick={() => navigate(`/artist/${album.artist_id}`)} className="font-semibold text-white hover:underline">
                {album.artist.name}
              </button>
            )}
            <span>·</span>
            <span>{songs.length} songs</span>
            <span>·</span>
            <span>{formatDuration(totalDuration)} total</span>
            {album.release_date && (
              <>
                <span>·</span>
                <span>{formatDate(album.release_date)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => (isPlayingAlbum ? togglePlay() : playQueue(songs))}
          className="w-14 h-14 rounded-full bg-accent flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlayingAlbum ? <Pause className="w-6 h-6 text-black fill-black" /> : <Play className="w-6 h-6 text-black fill-black ml-1" />}
        </button>
      </div>

      {/* Song list */}
      {songs.length === 0 ? (
        <EmptyState icon={<Clock className="w-8 h-8" />} title="No songs in this album" />
      ) : (
        <div className="space-y-1">
          <div className="grid grid-cols-[2rem_4fr_3fr_1fr_auto] gap-4 px-4 py-2 text-xs text-gray-400 uppercase tracking-wider border-b border-white/5 mb-2">
            <span className="text-center">#</span>
            <span>Title</span>
            <span className="hidden md:block">Album</span>
            <span className="text-right">Duration</span>
            <span></span>
          </div>
          {songs.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} queue={songs} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
