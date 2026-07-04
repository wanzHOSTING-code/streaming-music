import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song, RepeatMode, PlaybackSpeed } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

type PlayerState = {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  playbackSpeed: PlaybackSpeed;
  showQueue: boolean;
  showLyrics: boolean;
  isMiniPlayer: boolean;
  lastPosition: Record<string, number>;

  playSong: (song: Song, queue?: Song[]) => void;
  playQueue: (songs: Song[], index?: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  toggleQueue: () => void;
  toggleLyrics: () => void;
  toggleMiniPlayer: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  recordPlay: (songId: string) => Promise<void>;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      queueIndex: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      isMuted: false,
      repeatMode: 'off',
      isShuffled: false,
      playbackSpeed: 1,
      showQueue: false,
      showLyrics: false,
      isMiniPlayer: false,
      lastPosition: {},

      playSong: (song, queue) => {
        const state = get();
        const newQueue = queue && queue.length > 0 ? queue : [song];
        const index = newQueue.findIndex((s) => s.id === song.id);
        const savedPosition = state.lastPosition[song.id] || 0;
        set({
          currentSong: song,
          queue: newQueue,
          queueIndex: index >= 0 ? index : 0,
          isPlaying: true,
          currentTime: savedPosition,
        });
        get().recordPlay(song.id);
      },

      playQueue: (songs, index = 0) => {
        if (songs.length === 0) return;
        const song = songs[index];
        const savedPosition = get().lastPosition[song.id] || 0;
        set({
          currentSong: song,
          queue: songs,
          queueIndex: index,
          isPlaying: true,
          currentTime: savedPosition,
        });
        get().recordPlay(song.id);
      },

      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

      next: () => {
        const { queue, queueIndex, isShuffled, repeatMode } = get();
        if (queue.length === 0) return;
        if (repeatMode === 'one') {
          set({ currentTime: 0, isPlaying: true });
          return;
        }
        let nextIndex;
        if (isShuffled) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else {
          nextIndex = queueIndex + 1;
          if (nextIndex >= queue.length) {
            if (repeatMode === 'all') {
              nextIndex = 0;
            } else {
              set({ isPlaying: false });
              return;
            }
          }
        }
        const song = queue[nextIndex];
        const savedPosition = get().lastPosition[song.id] || 0;
        set({ currentSong: song, queueIndex: nextIndex, currentTime: savedPosition, isPlaying: true });
        get().recordPlay(song.id);
      },

      prev: () => {
        const { queue, queueIndex, currentTime } = get();
        if (queue.length === 0) return;
        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }
        let prevIndex = queueIndex - 1;
        if (prevIndex < 0) prevIndex = queue.length - 1;
        const song = queue[prevIndex];
        const savedPosition = get().lastPosition[song.id] || 0;
        set({ currentSong: song, queueIndex: prevIndex, currentTime: savedPosition, isPlaying: true });
        get().recordPlay(song.id);
      },

      seek: (time) => set({ currentTime: time }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),

      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

      toggleRepeat: () =>
        set((s) => ({
          repeatMode: s.repeatMode === 'off' ? 'all' : s.repeatMode === 'all' ? 'one' : 'off',
        })),

      toggleShuffle: () => set((s) => ({ isShuffled: !s.isShuffled })),
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
      toggleQueue: () => set((s) => ({ showQueue: !s.showQueue, showLyrics: false })),
      toggleLyrics: () => set((s) => ({ showLyrics: !s.showLyrics, showQueue: false })),
      toggleMiniPlayer: () => set((s) => ({ isMiniPlayer: !s.isMiniPlayer })),

      addToQueue: (song) => set((s) => ({ queue: [...s.queue, song] })),

      removeFromQueue: (index) =>
        set((s) => {
          const newQueue = s.queue.filter((_, i) => i !== index);
          return { queue: newQueue };
        }),

      clearQueue: () => set({ queue: [], queueIndex: 0, currentSong: null, isPlaying: false }),

      recordPlay: async (songId) => {
        const { session } = useAuthStore.getState();
        if (!session?.user?.id) return;
        try {
          // Check if already played recently (within last minute)
          const { data: existing } = await supabase
            .from('recently_played')
            .select('id, play_count')
            .eq('user_id', session.user.id)
            .eq('song_id', songId)
            .order('played_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('recently_played')
              .update({ played_at: new Date().toISOString(), play_count: existing.play_count + 1 })
              .eq('id', existing.id);
          } else {
            await supabase.from('recently_played').insert({
              user_id: session.user.id,
              song_id: songId,
            });
          }
          // Increment song play count
          await supabase.rpc('increment_play_count', { song_id: songId }).catch(() => {});
        } catch (e) {
          console.error('Failed to record play:', e);
        }
      },
    }),
    {
      name: 'wave-player',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
        isShuffled: state.isShuffled,
        playbackSpeed: state.playbackSpeed,
        lastPosition: state.lastPosition,
        currentSong: state.currentSong,
        queue: state.queue,
        queueIndex: state.queueIndex,
      }),
    }
  )
);
