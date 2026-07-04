import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export function LyricsPanel() {
  const { currentSong, currentTime, toggleLyrics } = usePlayerStore();

  const lyrics = currentSong?.lyrics;
  const lines = lyrics ? lyrics.split('\n').filter((l) => l.trim()) : [];

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 bottom-20 md:bottom-24 w-full sm:w-96 bg-base-elevated z-40 shadow-2xl flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h3 className="text-lg font-bold text-white">Lyrics</h3>
        <button onClick={toggleLyrics} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {lines.length > 0 ? (
          <div className="space-y-4">
            {lines.map((line, i) => (
              <motion.p
                key={i}
                animate={{
                  opacity: 0.4,
                  scale: 1,
                }}
                className="text-lg font-bold text-white"
              >
                {line}
              </motion.p>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-400 mb-2">No lyrics available for this song</p>
            <p className="text-sm text-gray-500">Lyrics can be added from the admin panel</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
