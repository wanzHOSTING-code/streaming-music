import { useEffect, useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Music, Disc, Mic2, Tag, Upload, LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

export function AdminLayout() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-bg">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">Access Denied</p>
          <p className="text-gray-400 mb-4">You need admin privileges to access this page.</p>
          <button onClick={() => navigate('/')} className="btn-accent">Go Home</button>
        </div>
      </div>
    );
  }

  const navItem = (to: string, icon: React.ReactNode, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn('flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors', isActive ? 'bg-accent text-black' : 'text-gray-300 hover:bg-white/5')
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-base-bg flex">
      {/* Sidebar */}
      <aside className="w-60 bg-base-sidebar flex flex-col p-3 flex-shrink-0 hidden md:flex">
        <div className="flex items-center gap-2 px-2 py-4 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Music className="w-5 h-5 text-black" />
          </div>
          <span className="font-extrabold">Wave Admin</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItem('/admin', <LayoutDashboard className="w-5 h-5" />, 'Dashboard')}
          {navItem('/admin/upload', <Upload className="w-5 h-5" />, 'Upload Song')}
          {navItem('/admin/songs', <Music className="w-5 h-5" />, 'Manage Songs')}
          {navItem('/admin/albums', <Disc className="w-5 h-5" />, 'Manage Albums')}
          {navItem('/admin/artists', <Mic2 className="w-5 h-5" />, 'Manage Artists')}
          {navItem('/admin/genres', <Tag className="w-5 h-5" />, 'Manage Genres')}
        </nav>
        <div className="flex flex-col gap-1 pt-4 border-t border-white/5">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" /> Back to App
          </button>
          <button onClick={async () => { await signOut(); navigate('/login'); }} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-white/5">
            <LogOut className="w-5 h-5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-base-sidebar border-t border-white/5 flex justify-around py-2 z-50">
        <NavLink to="/admin" end className="flex flex-col items-center text-xs text-gray-400">
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/upload" className="flex flex-col items-center text-xs text-gray-400">
          <Upload className="w-5 h-5" />
          <span>Upload</span>
        </NavLink>
        <NavLink to="/admin/songs" className="flex flex-col items-center text-xs text-gray-400">
          <Music className="w-5 h-5" />
          <span>Songs</span>
        </NavLink>
        <NavLink to="/admin/albums" className="flex flex-col items-center text-xs text-gray-400">
          <Disc className="w-5 h-5" />
          <span>Albums</span>
        </NavLink>
        <NavLink to="/admin/artists" className="flex flex-col items-center text-xs text-gray-400">
          <Mic2 className="w-5 h-5" />
          <span>Artists</span>
        </NavLink>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
