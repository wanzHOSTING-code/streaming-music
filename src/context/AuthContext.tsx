import { useEffect, createContext, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';

type AuthContextType = {
  initialized: boolean;
};

const AuthContext = createContext<AuthContextType>({ initialized: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setSession, loadProfile, initialized } = useAuthStore();
  const loadFavorites = useFavoritesStore((s) => s.loadFavorites);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user?.id) {
        loadProfile(session.user.id);
        loadFavorites();
      }
      useAuthStore.setState({ initialized: true });
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!mounted) return;
        setSession(session);
        if (session?.user?.id) {
          await loadProfile(session.user.id);
          loadFavorites();
        } else {
          useAuthStore.setState({ profile: null });
        }
      })();
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={{ initialized }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useAuthStore();
}
