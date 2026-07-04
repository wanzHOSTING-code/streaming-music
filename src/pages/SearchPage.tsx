import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X } from 'lucide-react';
import { searchAll, fetchGenres } from '../lib/queries';
import { SongRow } from '../components/SongRow';
import { EmptyState } from '../components/EmptyState';
import type { Song, Artist, Album, Genre } from '../types';

export function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ songs: Song[]; artists: Artist[]; albums: Album[]; genres: Genre[] }>({ songs: [], artists: [], albums: [], genres: [] });
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    fetchGenres().then(setGenres).catch(() => {});
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({ songs: [], artists: [], albums: [], genres: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await searchAll(q);
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 250);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const hasResults = results.songs.length > 0 || results.artists.length > 0 || results.albums.length > 0 || results.genres.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
      {/* Search bar */}
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums, genres..."
          className="w-full bg-white text-black rounded-full pl-11 pr-10 py-3 text-sm font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {!query.trim() ? (
        <>
          <h2 className="text-xl font-bold">Browse all</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {genres.map((genre, i) => (
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
              </motion.div>
            ))}
          </div>
        </>
      ) : loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-base-card rounded-md animate-pulse" />
          ))}
        </div>
      ) : !hasResults ? (
        <EmptyState
          icon={<SearchIcon className="w-8 h-8" />}
          title="No results found"
          description={`We couldn't find anything for "${query}". Try a different search term.`}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={query} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Top result + Songs */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
              {results.songs[0] && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Top result</h2>
                  <div
                    onClick={() => navigate(`/album/${results.songs[0].album_id}`)}
                    className="bg-base-card hover:bg-base-hover rounded-2xl p-5 cursor-pointer transition-colors group"
                  >
                    <img src={results.songs[0].cover_url || results.songs[0].album?.cover_url || ''} alt="" className="w-24 h-24 rounded-lg shadow-xl mb-3" />
                    <p className="text-2xl font-bold truncate">{results.songs[0].title}</p>
                    <p className="text-sm text-gray-400 mt-1">Song · {results.songs[0].artist?.name}</p>
                  </div>
                </div>
              )}
              {results.songs.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Songs</h2>
                  <div className="space-y-1">
                    {results.songs.slice(0, 5).map((song, i) => (
                      <SongRow key={song.id} song={song} index={i} queue={results.songs} showAlbum={false} showIndex={false} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Artists */}
            {results.artists.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3">Artists</h2>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                  {results.artists.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => navigate(`/artist/${artist.id}`)}
                      className="bg-base-card hover:bg-base-hover rounded-2xl p-4 cursor-pointer transition-colors min-w-[160px] max-w-[200px] flex-shrink-0"
                    >
                      <img src={artist.image_url || ''} alt="" className="w-full aspect-square rounded-full object-cover mb-3 shadow-lg" />
                      <p className="text-sm font-semibold truncate">{artist.name}</p>
                      <p className="text-xs text-gray-400">Artist</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Albums */}
            {results.albums.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3">Albums</h2>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                  {results.albums.map((album) => (
                    <div
                      key={album.id}
                      onClick={() => navigate(`/album/${album.id}`)}
                      className="bg-base-card hover:bg-base-hover rounded-2xl p-4 cursor-pointer transition-colors min-w-[160px] max-w-[200px] flex-shrink-0"
                    >
                      <img src={album.cover_url || ''} alt="" className="w-full aspect-square rounded-lg object-cover mb-3 shadow-lg" />
                      <p className="text-sm font-semibold truncate">{album.title}</p>
                      <p className="text-xs text-gray-400 truncate">{album.artist?.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Genres */}
            {results.genres.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3">Genres</h2>
                <div className="flex gap-3 flex-wrap">
                  {results.genres.map((genre) => (
                    <div
                      key={genre.id}
                      onClick={() => navigate(`/genre/${genre.id}`)}
                      className="px-6 py-3 rounded-xl cursor-pointer font-semibold text-white"
                      style={{ background: genre.color || '#1DB954' }}
                    >
                      {genre.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
