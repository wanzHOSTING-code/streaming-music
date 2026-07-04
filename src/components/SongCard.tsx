import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { cn } from '../lib/utils';
import type { Song } from '../types';

type SongCardProps = {
  song: Song;
  queue?: Song[];
};

export function SongCard({ song, queue }: SongCardProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [hovering, setHovering] = useState(false);
  const isCurrent = currentSong?.id === song.id;
  const fav = isFavorite(song.id);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => (isCurrent ? togglePlay() : playSong(song, queue))}
      className={cn(
        'group relative bg-base-card rounded-2xl p-4 cursor-pointer transition-colors',
        isCurrent ? 'bg-base-hover' : 'hover:bg-base-hover'
      )}
    >
      <div className="relative aspect-square mb-3 rounded-lg overflow-hidden shadow-lg">
        <img
          src={song.cover_url || song.album?.cover_url || ''}
          alt={song.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <motion.div
          initial={false}
          animate={{ opacity: hovering ? 1 : 0, y: hovering ? 0 : 8 }}
          className="absolute bottom-2 right-2"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              isCurrent ? togglePlay() : playSong(song, queue);
            }}
            className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 text-black fill-black" />
            ) : (
              <Play className="w-5 h-5 text-black fill-black ml-0.5" />
            )}
          </button>
        </motion.div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-semibold truncate', isCurrent && 'text-accent')}>
            {song.title}
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5">{song.artist?.name}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
          }}
          className={cn('flex-shrink-0 transition-opacity', hovering || fav ? 'opacity-100' : 'opacity-0')}
        >
          <Heart className={cn('w-4 h-4', fav ? 'fill-accent text-accent' : 'text-gray-400 hover:text-white')} />
        </button>
      </div>
    </motion.div>
  );
}
