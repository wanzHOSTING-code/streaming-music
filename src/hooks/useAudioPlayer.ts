import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    playbackSpeed,
    setCurrentTime,
    setDuration,
    next,
    repeatMode,
    lastPosition,
  } = usePlayerStore();

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Load new song
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    audioRef.current.src = currentSong.audio_url;
    audioRef.current.load();
    // Restore saved position
    const saved = lastPosition[currentSong.id] || 0;
    if (saved > 0 && saved < (currentSong.duration || 9999)) {
      audioRef.current.currentTime = saved;
      setCurrentTime(saved);
    } else {
      setCurrentTime(0);
    }
  }, [currentSong?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Play/pause
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.play().catch((e) => {
        console.error('Play failed:', e);
        usePlayerStore.setState({ isPlaying: false });
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Playback speed
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Time update
  useEffect(() => {
    if (!audioRef.current) return;
    const onTimeUpdate = () => {
      setCurrentTime(audioRef.current!.currentTime);
      // Save position periodically
      if (currentSong && audioRef.current!.currentTime > 0) {
        usePlayerStore.setState((s) => ({
          lastPosition: { ...s.lastPosition, [currentSong.id]: audioRef.current!.currentTime },
        }));
      }
    };
    const onLoadedMetadata = () => {
      setDuration(audioRef.current!.duration);
    };
    const onEnded = () => {
      if (repeatMode === 'one') {
        audioRef.current!.currentTime = 0;
        audioRef.current!.play();
      } else {
        next();
      }
    };
    audioRef.current.addEventListener('timeupdate', onTimeUpdate);
    audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
    audioRef.current.addEventListener('ended', onEnded);
    return () => {
      audioRef.current?.removeEventListener('timeupdate', onTimeUpdate);
      audioRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata);
      audioRef.current?.removeEventListener('ended', onEnded);
    };
  }, [currentSong?.id, repeatMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          usePlayerStore.getState().togglePlay();
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            usePlayerStore.getState().next();
          } else if (audioRef.current) {
            audioRef.current.currentTime += 5;
          }
          break;
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            usePlayerStore.getState().prev();
          } else if (audioRef.current) {
            audioRef.current.currentTime -= 5;
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          usePlayerStore.setState((s) => ({ volume: Math.min(1, s.volume + 0.1), isMuted: false }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          usePlayerStore.setState((s) => ({ volume: Math.max(0, s.volume - 0.1) }));
          break;
        case 'KeyM':
          usePlayerStore.getState().toggleMute();
          break;
        case 'KeyS':
          usePlayerStore.getState().toggleShuffle();
          break;
        case 'KeyR':
          usePlayerStore.getState().toggleRepeat();
          break;
        case 'KeyL':
          if (currentSong) {
            useFavoritesStore.getState().toggleFavorite(currentSong.id);
          }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentSong?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return { seekTo };
}

// Import needed for keyboard shortcut
import { useFavoritesStore } from '../store/favoritesStore';
