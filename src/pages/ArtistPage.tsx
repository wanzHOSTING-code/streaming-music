import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Mic2 } from 'lucide-react';
import { fetchArtistById, fetchArtistSongs, fetchArtistAlbums } from '../lib/queries';
import { usePlayerStore } from '../store/playerStore';
import { SongRow } from '../components/SongRow';
import { SkeletonRow } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { HorizontalScroller, CardWrapper } from '../components/HorizontalScroller';
import { formatPlayCount } from '../lib/utils';
import type { Artist, Song, Album } from '../types';

export function ArtistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSong, isPlaying, playQueue, togglePlay } = usePlayerStore();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchArtistById(id), fetchArtistSongs(id), fetchArtistAlbums(id)])
      .then(([a, s, al]) => {
        setArtist(a);
        setSongs(s);
        setAlbums(al);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}</div>;
  if (!artist) return <EmptyState icon={<Mic2 className="w-8 h-8" />} title="Artist not found" />;

  const isPlayingArtist = songs.some((s) => s.id === currentSong?.id) && isPlaying;
  const topSongs = songs.slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Banner */}
      <div className="relative h-64 md:h-80 mb-6 rounded-2xl overflow-hidden">
        <img src={artist.image_url || ''} alt={artist.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-base-bg via-base-bg/50 to-transparent" />
        <div className="absolute bottom-4 left-6">
          <p className="text-sm font-semibold text-gray-200 mb-1">{formatPlayCount(artist.monthly_listeners)} monthly listeners</p>
          <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">{artist.name}</h1>
        </div>
      </div>

      {artist.bio && <p className="text-gray-300 max-w-2xl mb-6">{artist.bio}</p>}

      {/* Actions */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => (isPlayingArtist ? togglePlay() : playQueue(songs))}
          className="w-14 h-14 rounded-full bg-accent flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlayingArtist ? <Pause className="w-6 h-6 text-black fill-black" /> : <Play className="w-6 h-6 text-black fill-black ml-1" />}
        </button>
      </div>

      {/* Popular songs */}
      <h2 className="text-xl font-bold mb-3">Popular</h2>
      {songs.length === 0 ? (
        <EmptyState icon={<Mic2 className="w-8 h-8" />} title="No songs yet" />
      ) : (
        <div className="space-y-1 mb-8">
          {topSongs.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} queue={songs} showAlbum={false} />
          ))}
        </div>
      )}

      {/* Discography */}
      {albums.length > 0 && (
        <HorizontalScroller title="Discography">
          {albums.map((album) => (
            <CardWrapper key={album.id} onClick={() => navigate(`/album/${album.id}`)}>
              <div className="aspect-square mb-3 rounded-lg overflow-hidden shadow-lg">
                <img src={album.cover_url || ''} alt={album.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="text-sm font-semibold truncate">{album.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{album.release_date?.split('-')[0] || ''}</p>
            </CardWrapper>
          ))}
        </HorizontalScroller>
      )}
    </motion.div>
  );
}
