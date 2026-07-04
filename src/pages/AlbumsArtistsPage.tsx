import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Disc } from 'lucide-react';
import { fetchAlbums, fetchArtists } from '../lib/queries';
import { SkeletonCard } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import type { Album, Artist } from '../types';

export function AlbumsPage() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbums().then(setAlbums).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-6">Albums</h1>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : albums.length === 0 ? (
        <EmptyState icon={<Disc className="w-8 h-8" />} title="No albums yet" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {albums.map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/album/${album.id}`)}
              className="bg-base-card hover:bg-base-hover rounded-2xl p-4 cursor-pointer transition-colors"
            >
              <div className="aspect-square mb-3 rounded-lg overflow-hidden shadow-lg">
                <img src={album.cover_url || ''} alt={album.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="text-sm font-semibold truncate">{album.title}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{album.artist?.name}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function ArtistsPage() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists().then(setArtists).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-6">Artists</h1>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : artists.length === 0 ? (
        <EmptyState title="No artists yet" icon={<Mic2 className="w-8 h-8" />} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {artists.map((artist, i) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/artist/${artist.id}`)}
              className="bg-base-card hover:bg-base-hover rounded-2xl p-4 cursor-pointer transition-colors text-center"
            >
              <div className="aspect-square mb-3 rounded-full overflow-hidden shadow-lg">
                <img src={artist.image_url || ''} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="text-sm font-semibold truncate">{artist.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Artist</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
