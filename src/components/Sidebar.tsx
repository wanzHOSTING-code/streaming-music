import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  Library,
  Plus,
  Heart,
  Clock,
  Music,
  Disc,
  Mic2,
  Settings,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { fetchUserPlaylists, createPlaylist } from '../lib/queries';
import type { Playlist } from '../types';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchUserPlaylists(profile.id).then(setPlaylists).catch(() => {});
    }
  }, [profile?.id]);

  const handleCreatePlaylist = async () => {
    if (!profile?.id) return;
    setCreating(true);
    try {
      const playlist = await createPlaylist(`My Playlist #${playlists.length + 1}`, profile.id);
      if (playlist) {
        setPlaylists([playlist, ...playlists]);
        navigate(`/playlist/${playlist.id}`);
        onNavigate?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const navItem = (to: string, icon: React.ReactNode, label: string) => (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-4 px-3 py-2 rounded-md text-sm font-semibold transition-colors',
          isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white'
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );

  return (
    <nav className="flex flex-col h-full gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Music className="w-5 h-5 text-black" />
        </div>
        <span className="text-xl font-extrabold tracking-tight">Wave Music</span>
      </div>

      {/* Main nav */}
      <div className="bg-base-card rounded-2xl p-2 flex flex-col gap-1">
        {navItem('/', <Home className="w-6 h-6" />, 'Home')}
        {navItem('/search', <Search className="w-6 h-6" />, 'Search')}
      </div>

      {/* Library section */}
      <div className="bg-base-card rounded-2xl p-2 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 py-2">
          <NavLink
            to="/library"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 text-sm font-semibold transition-colors',
                isActive ? 'text-white' : 'text-gray-400 hover:text-white'
              )
            }
          >
            <Library className="w-6 h-6" />
            <span>Your Library</span>
          </NavLink>
          <button
            onClick={handleCreatePlaylist}
            disabled={creating}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Create playlist"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-1 mt-2">
          <NavLink
            to="/liked"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                isActive ? 'bg-white/10' : 'hover:bg-white/5'
              )
            }
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">Liked Songs</p>
              <p className="text-xs text-gray-400">Playlist</p>
            </div>
          </NavLink>
          <NavLink
            to="/recently-played"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                isActive ? 'bg-white/10' : 'hover:bg-white/5'
              )
            }
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">Recently Played</p>
              <p className="text-xs text-gray-400">History</p>
            </div>
          </NavLink>
        </div>

        {/* Playlists */}
        <div className="flex-1 overflow-y-auto mt-2 -mx-1 px-1">
          {playlists.map((pl) => (
            <NavLink
              key={pl.id}
              to={`/playlist/${pl.id}`}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  isActive ? 'bg-white/10' : 'hover:bg-white/5'
                )
              }
            >
              <div className="w-10 h-10 rounded-md bg-base-hover flex items-center justify-center overflow-hidden flex-shrink-0">
                {pl.cover_url ? (
                  <img src={pl.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Disc className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{pl.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  Playlist {pl.is_favorite && '· ❤'}
                </p>
              </div>
            </NavLink>
          ))}
          {playlists.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-gray-500">No playlists yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="bg-base-card rounded-2xl p-2 flex flex-col gap-1">
        {navItem('/albums', <Disc className="w-5 h-5" />, 'Albums')}
        {navItem('/artists', <Mic2 className="w-5 h-5" />, 'Artists')}
        {navItem('/profile', <Settings className="w-5 h-5" />, 'Profile')}
        {profile?.is_admin && navItem('/admin', <Shield className="w-5 h-5" />, 'Admin Panel')}
      </div>
    </nav>
  );
}
