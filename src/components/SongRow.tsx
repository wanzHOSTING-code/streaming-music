import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { cn, formatDuration } from '../lib/utils';
import type { Song } from '../types';

type SongRowProps = {
  song: Song;
  index?: number;
  queue?: Song[];
  onRemove?: () => void;
  showAlbum?: boolean;
  showIndex?: boolean;
};

export function SongRow({ song, index, queue, onRemove, showAlbum = true, showIndex = false }: SongRowProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const [hovering, setHovering] = useState(false);
  const isCurrent = currentSong?.id === song.id;

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => {
        if (isCurrent) togglePlay();
        else playSong(song, queue);
      }}
      className={cn(
        'group grid items-center gap-4 rounded-md px-4 py-2 transition-colors cursor-pointer',
        showAlbum ? 'grid-cols-[2rem_4fr_3fr_1fr_auto]' : 'grid-cols-[2rem_4fr_1fr_auto]',
        isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
      )}
    >
      {/* Index / Play button */}
      <div className="flex items-center justify-center w-8 h-8">
        {isCurrent && isPlaying ? (
          <EqualizerIcon />
        ) : hovering ? (
          <Play className="w-4 h-4 text-white fill-white" />
        ) : showIndex && index !== undefined ? (
          <span className={cn('text-sm', isCurrent ? 'text-accent' : 'text-gray-400')}>
            {index + 1}
          </span>
        ) : (
          <span className={cn('text-sm', isCurrent ? 'text-accent' : 'text-gray-400')}>
            ♪
          </span>
        )}
      </div>

      {/* Title + Artist */}
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={song.cover_url || song.album?.cover_url || ''}
          alt={song.title}
          className="w-10 h-10 rounded object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="min-w-0">
          <p className={cn('text-sm font-medium truncate', isCurrent ? 'text-accent' : 'text-white')}>
            {song.title}
          </p>
          <p className="text-xs text-gray-400 truncate">{song.artist?.name || 'Unknown Artist'}</p>
        </div>
      </div>

      {/* Album */}
      {showAlbum && (
        <div className="min-w-0 hidden md:block">
          <p className="text-sm text-gray-400 truncate">{song.album?.title || '—'}</p>
        </div>
      )}

      {/* Duration */}
      <div className="text-sm text-gray-400 text-right tabular-nums">
        {formatDuration(song.duration)}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {onRemove && hovering && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-gray-400 hover:text-white"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function EqualizerIcon() {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-0.5 bg-accent rounded-full"
          animate={{ height: ['20%', '100%', '40%', '80%', '20%'] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          style={{ height: '100%' }}
        />
      ))}
    </div>
  );
}
