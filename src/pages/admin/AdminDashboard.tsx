import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Disc, Mic2, Tag, Heart, Play, TrendingUp, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ songs: 0, albums: 0, artists: 0, genres: 0, favorites: 0, plays: 0 });
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  const [topSongs, setTopSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, a, ar, g, f, p] = await Promise.all([
        supabase.from('songs').select('id', { count: 'exact', head: true }),
        supabase.from('albums').select('id', { count: 'exact', head: true }),
        supabase.from('artists').select('id', { count: 'exact', head: true }),
        supabase.from('genres').select('id', { count: 'exact', head: true }),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
        supabase.from('recently_played').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ songs: s.count || 0, albums: a.count || 0, artists: ar.count || 0, genres: g.count || 0, favorites: f.count || 0, plays: p.count || 0 });

      const { data: recent } = await supabase.from('songs').select('*, artist:artists(name)').order('created_at', { ascending: false }).limit(5);
      setRecentSongs(recent || []);
      const { data: top } = await supabase.from('songs').select('*, artist:artists(name)').order('play_count', { ascending: false }).limit(5);
      setTopSongs(top || []);
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: 'Songs', value: stats.songs, icon: <Music className="w-6 h-6" />, color: 'bg-accent/20 text-accent' },
    { label: 'Albums', value: stats.albums, icon: <Disc className="w-6 h-6" />, color: 'bg-blue-500/20 text-blue-400' },
    { label: 'Artists', value: stats.artists, icon: <Mic2 className="w-6 h-6" />, color: 'bg-purple-500/20 text-purple-400' },
    { label: 'Genres', value: stats.genres, icon: <Tag className="w-6 h-6" />, color: 'bg-orange-500/20 text-orange-400' },
    { label: 'Total Likes', value: stats.favorites, icon: <Heart className="w-6 h-6" />, color: 'bg-pink-500/20 text-pink-400' },
    { label: 'Total Plays', value: stats.plays, icon: <Play className="w-6 h-6" />, color: 'bg-cyan-500/20 text-cyan-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your music platform</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-base-card rounded-2xl p-5"
          >
            <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center mb-3`}>{c.icon}</div>
            <p className="text-2xl font-extrabold">{loading ? '...' : c.value}</p>
            <p className="text-sm text-gray-400">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick action */}
      <div className="bg-gradient-to-r from-accent/20 to-accent/5 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold mb-1">Upload a new song</h3>
          <p className="text-sm text-gray-400">Add music to your catalog</p>
        </div>
        <button onClick={() => navigate('/admin/upload')} className="btn-accent flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload
        </button>
      </div>

      {/* Recent & Top */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-base-card rounded-2xl p-5">
          <h3 className="text-lg font-bold mb-4">Recently Added</h3>
          <div className="space-y-2">
            {recentSongs.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <img src={s.cover_url || ''} alt="" className="w-10 h-10 rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.title}</p>
                  <p className="text-xs text-gray-400">{s.artist?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-base-card rounded-2xl p-5">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-accent" /> Top Played</h3>
          <div className="space-y-2">
            {topSongs.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 w-5">{i + 1}</span>
                <img src={s.cover_url || ''} alt="" className="w-10 h-10 rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.title}</p>
                  <p className="text-xs text-gray-400">{s.artist?.name}</p>
                </div>
                <span className="text-xs text-gray-400">{s.play_count} plays</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
