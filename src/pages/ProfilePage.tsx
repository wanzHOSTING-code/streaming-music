import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Music, Heart, ListMusic, Clock, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { fetchUserStats, fetchFavoriteSongs, fetchRecentlyPlayed } from '../lib/queries';
import { supabase } from '../lib/supabase';
import { SongRow } from '../components/SongRow';
import { SkeletonRow } from '../components/Skeleton';
import { getInitials } from '../lib/utils';
import type { Song } from '../types';

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuthStore();
  const [stats, setStats] = useState({ favorites: 0, playlists: 0, recentlyPlayed: 0 });
  const [favSongs, setFavSongs] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile?.id) return;
    Promise.all([fetchUserStats(profile.id), fetchFavoriteSongs(profile.id), fetchRecentlyPlayed(profile.id, 10)])
      .then(([s, f, r]) => { setStats(s); setFavSongs(f); setRecentSongs(r); })
      .finally(() => setLoading(false));
  }, [profile?.id]);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${profile.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', profile.id);
      refreshProfile();
    }
    setUploading(false);
  };

  if (!profile) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Profile header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <div className="relative">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl bg-base-hover">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-accent">
                {getInitials(profile.username)}
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Camera className="w-5 h-5 text-black" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
        </div>
        <div className="text-center md:text-left">
          <p className="text-sm font-semibold text-gray-300 mb-2">Profile</p>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2">{profile.username}</h1>
          <p className="text-sm text-gray-400">{profile.full_name || ''}</p>
          <p className="text-sm text-gray-400">{profile.username}</p>
          {profile.is_admin && <span className="inline-block mt-2 text-xs bg-accent/20 text-accent px-2 py-1 rounded-full font-semibold">Admin</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard icon={<Heart className="w-5 h-5" />} label="Liked Songs" value={stats.favorites} />
        <StatCard icon={<ListMusic className="w-5 h-5" />} label="Playlists" value={stats.playlists} />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Played" value={stats.recentlyPlayed} />
      </div>

      {/* Favorite songs */}
      <h2 className="text-xl font-bold mb-3">Favorite Songs</h2>
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : favSongs.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">No favorite songs yet.</p>
      ) : (
        <div className="space-y-1 mb-8">
          {favSongs.slice(0, 5).map((song, i) => <SongRow key={song.id} song={song} index={i} queue={favSongs} />)}
        </div>
      )}

      {/* Recently played */}
      <h2 className="text-xl font-bold mb-3">Recently Played</h2>
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : recentSongs.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">No listening history yet.</p>
      ) : (
        <div className="space-y-1">
          {recentSongs.slice(0, 5).map((song, i) => <SongRow key={song.id} song={song} index={i} queue={recentSongs} />)}
        </div>
      )}

      <button onClick={() => navigate('/settings')} className="mt-8 flex items-center gap-2 text-gray-400 hover:text-white">
        <Settings className="w-5 h-5" /> Settings
      </button>
    </motion.div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-base-card rounded-2xl p-4 flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-2">{icon}</div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
