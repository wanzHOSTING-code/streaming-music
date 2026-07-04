import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Clock, Disc, Mic2, Plus, ListMusic } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { fetchUserPlaylists, fetchFavoriteSongs, fetchRecentlyPlayed } from '../lib/queries';
import { EmptyState } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { createPlaylist } from '../lib/queries';
import type { Playlist, Song } from '../types';

export function LibraryPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [recent, setRecent] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    Promise.all([
      fetchUserPlaylists(profile.id),
      fetchFavoriteSongs(profile.id),
      fetchRecentlyPlayed(profile.id, 10),
    ])
      .then(([p, f, r]) => {
        setPlaylists(p);
        setFavorites(f);
        setRecent(r);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile?.id]);

  const handleCreate = async () => {
    if (!profile?.id) return;
    const pl = await createPlaylist(`My Playlist #${playlists.length + 1}`, profile.id);
    if (pl) navigate(`/playlist/${pl.id}`);
  };

  if (loading) return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold">Your Library</h1>
        <button onClick={handleCreate} className="flex items-center gap-2 bg-accent text-black font-bold rounded-full px-4 py-2 hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button onClick={() => navigate('/liked')} className="flex items-center gap-4 bg-base-card hover:bg-base-hover rounded-lg p-3 transition-colors text-left">
          <div className="w-16 h-16 rounded bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center">
            <Heart className="w-7 h-7 text-white fill-white" />
          </div>
          <div>
            <p className="font-semibold">Liked Songs</p>
            <p className="text-xs text-gray-400">{favorites.length} songs</p>
          </div>
        </button>
        <button onClick={() => navigate('/recently-played')} className="flex items-center gap-4 bg-base-card hover:bg-base-hover rounded-lg p-3 transition-colors text-left">
          <div className="w-16 h-16 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="font-semibold">Recently Played</p>
            <p className="text-xs text-gray-400">{recent.length} songs</p>
          </div>
        </button>
        <button onClick={() => navigate('/albums')} className="flex items-center gap-4 bg-base-card hover:bg-base-hover rounded-lg p-3 transition-colors text-left">
          <div className="w-16 h-16 rounded bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Disc className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="font-semibold">Albums</p>
            <p className="text-xs text-gray-400">Browse all</p>
          </div>
        </button>
      </div>

      {/* Playlists */}
      <div>
        <h2 className="text-xl font-bold mb-4">Playlists</h2>
        {playlists.length === 0 ? (
          <EmptyState
            icon={<ListMusic className="w-8 h-8" />}
            title="No playlists yet"
            description="Create your first playlist to get started."
            action={<button onClick={handleCreate} className="btn-accent">Create Playlist</button>}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map((pl) => (
              <motion.div
                key={pl.id}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/playlist/${pl.id}`)}
                className="bg-base-card hover:bg-base-hover rounded-2xl p-4 cursor-pointer transition-colors"
              >
                <div className="aspect-square mb-3 rounded-lg overflow-hidden shadow-lg bg-base-hover flex items-center justify-center">
                  {pl.cover_url ? (
                    <img src={pl.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ListMusic className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <p className="text-sm font-semibold truncate">{pl.name}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">Playlist</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
