import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  ListMusic,
  Mic2,
  Minimize2,
  Maximize2,
  Heart,
  Gauge,
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { formatDuration, cn } from '../lib/utils';
import type { PlaybackSpeed } from '../types';
import { QueuePanel } from './QueuePanel';
import { LyricsPanel } from './LyricsPanel';

export function Player() {
  const { seekTo } = useAudioPlayer();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    playbackSpeed,
    showQueue,
    showLyrics,
    isMiniPlayer,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    setPlaybackSpeed,
    toggleQueue,
    toggleLyrics,
    toggleMiniPlayer,
  } = usePlayerStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [showSpeed, setShowSpeed] = useState(false);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);

  if (!currentSong) {
    return (
      <div className="h-20 bg-base-sidebar border-t border-white/5 flex items-center justify-center text-sm text-gray-500">
        Select a song to start playing
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const fav = isFavorite(currentSong.id);
  const speeds: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const volIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const newTime = pct * duration;
    seekTo(newTime);
    seek(newTime);
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setHoverProgress(pct);
  };

  return (
    <>
      <AnimatePresence>
        {showQueue && <QueuePanel />}
        {showLyrics && <LyricsPanel />}
      </AnimatePresence>

      <div className={cn(
        'bg-base-sidebar border-t border-white/5 transition-all',
        isMiniPlayer ? 'h-14' : 'h-20 md:h-24'
      )}>
        <div className={cn(
          'grid items-center px-3 md:px-4 gap-2 md:gap-4 h-full',
          isMiniPlayer ? 'grid-cols-[1fr_auto]' : 'grid-cols-[1fr_2fr_1fr] md:grid-cols-[1fr_3fr_1fr]'
        )}>
          {/* Left: Song info */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentSong.cover_url || currentSong.album?.cover_url || ''}
              alt={currentSong.title}
              className={cn('rounded object-cover flex-shrink-0', isMiniPlayer ? 'w-10 h-10' : 'w-12 h-12 md:w-14 md:h-14')}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentSong.title}</p>
              <p className="text-xs text-gray-400 truncate">{currentSong.artist?.name}</p>
            </div>
            {!isMiniPlayer && (
              <button
                onClick={() => toggleFavorite(currentSong.id)}
                className="hidden sm:block ml-2 flex-shrink-0"
              >
                <Heart className={cn('w-4 h-4', fav ? 'fill-accent text-accent' : 'text-gray-400 hover:text-white')} />
              </button>
            )}
          </div>

          {/* Center: Controls */}
          {!isMiniPlayer && (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={toggleShuffle}
                  className={cn('hidden sm:block transition-colors', isShuffled ? 'text-accent' : 'text-gray-400 hover:text-white')}
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button onClick={prev} className="text-gray-300 hover:text-white transition-colors">
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-black fill-black" />
                  ) : (
                    <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                  )}
                </button>
                <button onClick={next} className="text-gray-300 hover:text-white transition-colors">
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
                <button
                  onClick={toggleRepeat}
                  className={cn('hidden sm:block transition-colors', repeatMode !== 'off' ? 'text-accent' : 'text-gray-400 hover:text-white')}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2 w-full max-w-xl">
                <span className="text-xs text-gray-400 tabular-nums w-10 text-right">
                  {formatDuration(currentTime)}
                </span>
                <div
                  className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer group relative"
                  onClick={handleProgressClick}
                  onMouseMove={handleProgressHover}
                  onMouseLeave={() => setHoverProgress(null)}
                >
                  <div
                    className="absolute h-full bg-white group-hover:bg-accent rounded-full transition-colors"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity -top-1"
                    style={{ left: `calc(${progress}% - 6px)` }}
                  />
                  {hoverProgress !== null && (
                    <div
                      className="absolute -top-6 bg-black/80 text-xs text-white px-1.5 py-0.5 rounded pointer-events-none"
                      style={{ left: `${hoverProgress}%`, transform: 'translateX(-50%)' }}
                    >
                      {formatDuration((hoverProgress / 100) * duration)}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 tabular-nums w-10">
                  {formatDuration(duration || currentSong.duration)}
                </span>
              </div>
            </div>
          )}

          {/* Right: Volume & extras */}
          <div className="flex items-center justify-end gap-2 md:gap-3">
            {!isMiniPlayer && (
              <>
                {/* Speed */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setShowSpeed(!showSpeed)}
                    className={cn('flex items-center gap-1 text-xs transition-colors', playbackSpeed !== 1 ? 'text-accent' : 'text-gray-400 hover:text-white')}
                  >
                    <Gauge className="w-4 h-4" />
                    <span className="tabular-nums">{playbackSpeed}x</span>
                  </button>
                  <AnimatePresence>
                    {showSpeed && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute bottom-10 right-0 bg-base-elevated rounded-lg shadow-2xl py-1 z-50 min-w-[80px]"
                      >
                        {speeds.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setPlaybackSpeed(s);
                              setShowSpeed(false);
                            }}
                            className={cn(
                              'w-full text-left px-3 py-1.5 text-sm hover:bg-white/10',
                              s === playbackSpeed ? 'text-accent font-semibold' : 'text-white'
                            )}
                          >
                            {s}x
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={toggleLyrics}
                  className={cn('hidden sm:block transition-colors', showLyrics ? 'text-accent' : 'text-gray-400 hover:text-white')}
                >
                  <Mic2 className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleQueue}
                  className={cn('hidden sm:block transition-colors', showQueue ? 'text-accent' : 'text-gray-400 hover:text-white')}
                >
                  <ListMusic className="w-4 h-4" />
                </button>

                {/* Volume */}
                <div className="hidden md:flex items-center gap-2">
                  <button onClick={toggleMute} className="text-gray-400 hover:text-white">
                    {volIcon}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 h-1"
                    style={{
                      background: `linear-gradient(to right, #fff ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`,
                      borderRadius: '2px',
                    }}
                  />
                </div>

                <button
                  onClick={toggleMiniPlayer}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </>
            )}
            {isMiniPlayer && (
              <>
                <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  {isPlaying ? <Pause className="w-4 h-4 text-black fill-black" /> : <Play className="w-4 h-4 text-black fill-black ml-0.5" />}
                </button>
                <button onClick={toggleMiniPlayer} className="text-gray-400 hover:text-white">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
