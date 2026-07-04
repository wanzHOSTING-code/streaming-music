import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Disc } from 'lucide-react';
import { HorizontalScroller, CardWrapper } from '../components/HorizontalScroller';
import { SkeletonScroller } from '../components/Skeleton';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { getGreeting, cn } from '../lib/utils';
import {
  fetchTrendingSongs,
  fetchRecentSongs,
  fetchAlbums,
  fetchArtists,
  fetchGenres,
  fetchRecentlyPlayed,
} from '../lib/queries';
import type { Song, Album, Artist, Genre } from '../types';

export function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { playSong, currentSong, togglePlay } = usePlayerStore();
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState<Song[]>([]);
  const [recent, setRecent] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [t, r, a, ar, g] = await Promise.all([
          fetchTrendingSongs(10),
          fetchRecentSongs(10),
          fetchAlbums(),
          fetchArtists(),
          fetchGenres(),
        ]);
        setTrending(t);
        setRecent(r);
        setAlbums(a);
        setArtists(ar);
        setGenres(g);
        if (profile?.id) {
          const rp = await fetchRecentlyPlayed(profile.id, 10);
          setRecentlyPlayed(rp);
        }
      } catch (e) {
        console.error('Failed to load home data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile?.id]);

  const greeting = getGreeting();
  const quickPicks = recentlyPlayed.length > 0 ? recentlyPlayed.slice(0, 8) : trending.slice(0, 8);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-4">{greeting}, {profile?.username || 'there'}</h1>

        {/* Quick picks grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-base-card rounded-lg animate-pulse" />
            ))
          ) : (
            quickPicks.map((song, i) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => (isCurrent ? togglePlay() : playSong(song, quickPicks))}
                  className="group flex items-center gap-3 bg-base-card hover:bg-base-hover rounded-lg overflow-hidden cursor-pointer transition-colors"
                >
                  <img
                    src={song.cover_url || song.album?.cover_url || ''}
                    alt=""
                    className="w-16 h-16 object-cover flex-shrink-0"
                  />
                  <p className="flex-1 text-sm font-semibold truncate pr-2">{song.title}</p>
                  <button className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mr-3 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105">
                    <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <HorizontalScroller title="Recently Played">
          {loading ? (
            <SkeletonScroller />
          ) : (
            recentlyPlayed.map((song) => <SongCardMini key={song.id} song={song} queue={recentlyPlayed} />)
          )}
        </HorizontalScroller>
      )}

      {/* Made For You / Trending */}
      <HorizontalScroller title="Made For You">
        {loading ? (
          <SkeletonScroller />
        ) : (
          recent.map((song) => <SongCardMini key={song.id} song={song} queue={recent} />)
        )}
      </HorizontalScroller>

      {/* Trending */}
      <HorizontalScroller title="Trending Now">
        {loading ? (
          <SkeletonScroller />
        ) : (
          trending.map((song) => <SongCardMini key={song.id} song={song} queue={trending} />)
        )}
      </HorizontalScroller>

      {/* Popular Albums */}
      <HorizontalScroller title="Popular Albums">
        {loading ? (
          <SkeletonScroller />
        ) : (
          albums.map((album) => (
            <CardWrapper key={album.id} onClick={() => navigate(`/album/${album.id}`)}>
              <div className="aspect-square mb-3 rounded-lg overflow-hidden shadow-lg">
                <img src={album.cover_url || ''} alt={album.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="text-sm font-semibold truncate">{album.title}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{album.artist?.name}</p>
            </CardWrapper>
          ))
        )}
      </HorizontalScroller>

      {/* Recommended Artists */}
      <HorizontalScroller title="Recommended Artists">
        {loading ? (
          <SkeletonScroller />
        ) : (
          artists.map((artist) => (
            <CardWrapper key={artist.id} onClick={() => navigate(`/artist/${artist.id}`)} className="text-center">
              <div className="aspect-square mb-3 rounded-full overflow-hidden shadow-lg">
                <img src={artist.image_url || ''} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="text-sm font-semibold truncate">{artist.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Artist</p>
            </CardWrapper>
          ))
        )}
      </HorizontalScroller>

      {/* Genres */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-4 px-1">Browse Genres</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] rounded-xl animate-pulse" style={{ background: '#181818' }} />
            ))
          ) : (
            genres.map((genre, i) => (
              <motion.div
                key={genre.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/genre/${genre.id}`)}
                className="relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer group"
                style={{ background: genre.color || '#1DB954' }}
              >
                <p className="absolute top-3 left-3 text-lg font-extrabold text-white drop-shadow-lg">{genre.name}</p>
                <Disc className="absolute -bottom-2 -right-2 w-16 h-16 text-black/30 rotate-12 group-hover:rotate-45 transition-transform" />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SongCardMini({ song, queue }: { song: Song; queue: Song[] }) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const isCurrent = currentSong?.id === song.id;
  return (
    <CardWrapper onClick={() => (isCurrent ? togglePlay() : playSong(song, queue))}>
      <div className="relative aspect-square mb-3 rounded-lg overflow-hidden shadow-lg">
        <img src={song.cover_url || song.album?.cover_url || ''} alt={song.title} className="w-full h-full object-cover" loading="lazy" />
        <button
          onClick={(e) => { e.stopPropagation(); isCurrent ? togglePlay() : playSong(song, queue); }}
          className={cn(
            'absolute bottom-2 right-2 w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-xl transition-all',
            isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100'
          )}
        >
          {isCurrent && isPlaying ? (
            <motion.div className="flex items-end gap-0.5 h-4">
              {[0,1,2].map(i => <motion.div key={i} className="w-0.5 bg-black rounded-full" animate={{height:['30%','100%','50%','80%','30%']}} transition={{duration:0.8,repeat:Infinity,delay:i*0.1}} style={{height:'100%'}}/>)}
            </motion.div>
          ) : (
            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
          )}
        </button>
      </div>
      <p className={cn('text-sm font-semibold truncate', isCurrent && 'text-accent')}>{song.title}</p>
      <p className="text-xs text-gray-400 truncate mt-0.5">{song.artist?.name}</p>
    </CardWrapper>
  );
}
