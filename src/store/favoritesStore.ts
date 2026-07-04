import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import type { Song } from '../types';

type FavoritesState = {
  favoriteIds: Set<string>;
  loading: boolean;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (songId: string) => Promise<void>;
  isFavorite: (songId: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set(),
  loading: false,

  loadFavorites: async () => {
    const { session } = useAuthStore.getState();
    if (!session?.user?.id) return;
    set({ loading: true });
    const { data } = await supabase
      .from('favorites')
      .select('song_id')
      .eq('user_id', session.user.id);
    const ids = new Set((data || []).map((f) => f.song_id));
    set({ favoriteIds: ids, loading: false });
  },

  toggleFavorite: async (songId) => {
    const { session } = useAuthStore.getState();
    if (!session?.user?.id) return;
    const { favoriteIds } = get();
    const isFav = favoriteIds.has(songId);
    // Optimistic update
    const newIds = new Set(favoriteIds);
    if (isFav) {
      newIds.delete(songId);
      set({ favoriteIds: newIds });
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('song_id', songId);
    } else {
      newIds.add(songId);
      set({ favoriteIds: newIds });
      await supabase.from('favorites').insert({
        user_id: session.user.id,
        song_id: songId,
      });
    }
  },

  isFavorite: (songId) => get().favoriteIds.has(songId),
}));
