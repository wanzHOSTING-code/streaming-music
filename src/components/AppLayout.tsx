import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Library, Plus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Player } from './Player';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { cn } from '../lib/utils';
import { createPlaylist } from '../lib/queries';

export function AppLayout() {
  const { profile } = useAuthStore();
  const { currentSong } = usePlayerStore();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('home');

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/') setMobileTab('home');
    else if (path.startsWith('/search')) setMobileTab('search');
    else if (path.startsWith('/library') || path.startsWith('/playlist') || path.startsWith('/liked') || path.startsWith('/recently-played'))
      setMobileTab('library');
  }, [window.location.pathname]);

  const handleCreatePlaylist = async () => {
    if (!profile?.id) return;
    const pl = await createPlaylist(`My Playlist`, profile.id);
    if (pl) navigate(`/playlist/${pl.id}`);
  };

  return (
    <div className="h-screen flex flex-col bg-base-bg overflow-hidden">
      <div className="flex flex-1 min-h-0 gap-0 md:gap-2 p-0 md:p-2">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 lg:w-72 flex-shrink-0">
          <div className="w-full">
            <Sidebar />
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileNavOpen(false)}
                className="fixed inset-0 bg-black/60 z-50 md:hidden"
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-72 z-50 md:hidden p-2"
              >
                <Sidebar onNavigate={() => setMobileNavOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-w-0 bg-base-bg md:rounded-2xl overflow-y-auto overflow-x-hidden relative">
          <TopBar />
          <div className="px-4 md:px-6 pb-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Player */}
      <div className={cn('flex-shrink-0', currentSong ? '' : '')}>
        <Player />
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden flex items-center justify-around bg-base-sidebar border-t border-white/5 py-2 px-4">
        <button
          onClick={() => navigate('/')}
          className={cn('flex flex-col items-center gap-0.5', mobileTab === 'home' ? 'text-white' : 'text-gray-400')}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>
        <button
          onClick={() => navigate('/search')}
          className={cn('flex flex-col items-center gap-0.5', mobileTab === 'search' ? 'text-white' : 'text-gray-400')}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Search</span>
        </button>
        <button
          onClick={() => navigate('/library')}
          className={cn('flex flex-col items-center gap-0.5', mobileTab === 'library' ? 'text-white' : 'text-gray-400')}
        >
          <Library className="w-5 h-5" />
          <span className="text-[10px]">Library</span>
        </button>
        <button
          onClick={handleCreatePlaylist}
          className="flex flex-col items-center gap-0.5 text-gray-400"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[10px]">Create</span>
        </button>
      </nav>
    </div>
  );
}
