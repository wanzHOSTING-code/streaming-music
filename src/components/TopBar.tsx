import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getInitials } from '../lib/utils';

export function TopBar() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 sticky top-0 z-30">
      {/* Nav arrows */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Search shortcut */}
      <button
        onClick={() => navigate('/search')}
        className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-full px-3 py-1.5 text-sm text-gray-300 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search</span>
      </button>

      {/* Profile menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 bg-black/40 hover:bg-black/60 rounded-full p-0.5 pr-2 transition-colors"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-black">
              {profile ? getInitials(profile.username) : <User className="w-4 h-4" />}
            </div>
          )}
          <span className="text-sm font-semibold text-white max-w-[100px] truncate hidden sm:block">
            {profile?.username || 'User'}
          </span>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 top-12 w-48 bg-base-elevated rounded-lg shadow-2xl py-1 z-50"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                Settings
              </button>
              {profile?.is_admin && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10"
                >
                  Admin Panel
                </button>
              )}
              <hr className="border-white/10 my-1" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
