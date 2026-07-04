import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { formatDuration, cn } from '../lib/utils';

export function QueuePanel() {
  const { queue, queueIndex, currentSong, isPlaying, playSong, removeFromQueue, clearQueue, toggleQueue } = usePlayerStore();

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 bottom-20 md:bottom-24 w-full sm:w-96 bg-base-elevated z-40 shadow-2xl flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h3 className="text-lg font-bold text-white">Queue</h3>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button onClick={clearQueue} className="text-gray-400 hover:text-white" title="Clear queue">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={toggleQueue} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {currentSong && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-accent uppercase tracking-wider px-2 mb-2">Now Playing</p>
            <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-white/5">
              <img src={currentSong.cover_url || currentSong.album?.cover_url || ''} alt="" className="w-10 h-10 rounded" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-accent truncate">{currentSong.title}</p>
                <p className="text-xs text-gray-400 truncate">{currentSong.artist?.name}</p>
              </div>
              <span className="text-xs text-gray-400">{formatDuration(currentSong.duration)}</span>
            </div>
          </div>
        )}

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Next Up</p>
        {queue.slice(queueIndex + 1).map((song, i) => (
          <div
            key={`${song.id}-${i}`}
            onClick={() => playSong(song, queue)}
            className={cn(
              'group flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer hover:bg-white/5 transition-colors'
            )}
          >
            <img src={song.cover_url || song.album?.cover_url || ''} alt="" className="w-10 h-10 rounded" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{song.title}</p>
              <p className="text-xs text-gray-400 truncate">{song.artist?.name}</p>
            </div>
            <span className="text-xs text-gray-400">{formatDuration(song.duration)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFromQueue(queueIndex + 1 + i);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {queue.length <= 1 && (
          <p className="text-sm text-gray-500 text-center py-8">Queue is empty</p>
        )}
      </div>
    </motion.div>
  );
}
