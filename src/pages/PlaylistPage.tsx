import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ListMusic, Trash2, Edit2, Heart, Search, X, MoreHorizontal, Upload } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import {
  fetchPlaylistById,
  fetchPlaylistSongs,
  updatePlaylist,
  deletePlaylist,
  removeSongFromPlaylist,
  fetchSongs,
} from '../lib/queries';
import { supabase } from '../lib/supabase';
import { SongRow } from '../components/SongRow';
import { SkeletonRow } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { cn } from '../lib/utils';
import type { Playlist, Song } from '../types';

export function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { currentSong, isPlaying, playQueue, togglePlay } = usePlayerStore();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchPlaylistById(id), fetchPlaylistSongs(id)])
      .then(([p, s]) => {
        setPlaylist(p);
        setSongs(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSaveName = async () => {
    if (!playlist || !editName.trim()) return;
    await updatePlaylist(playlist.id, { name: editName.trim() });
    setPlaylist({ ...playlist, name: editName.trim() });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!playlist) return;
    if (!confirm('Delete this playlist?')) return;
    await deletePlaylist(playlist.id);
    navigate('/library');
  };

  const handleToggleFavorite = async () => {
    if (!playlist) return;
    const newVal = !playlist.is_favorite;
    await updatePlaylist(playlist.id, { is_favorite: newVal });
    setPlaylist({ ...playlist, is_favorite: newVal });
    setMenuOpen(false);
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist) return;
    await removeSongFromPlaylist(playlist.id, songId);
    setSongs(songs.filter((s) => s.id !== songId));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !playlist || !profile?.id) return;
    const ext = file.name.split('.').pop();
    const path = `${profile.id}/${playlist.id}.${ext}`;
    const { error } = await supabase.storage.from('covers').upload(path, file, { upsert: true });
    if (error) { alert('Upload failed: ' + error.message); return; }
    const { data: urlData } = supabase.storage.from('covers').getPublicUrl(path);
    await updatePlaylist(playlist.id, { cover_url: urlData.publicUrl });
    setPlaylist({ ...playlist, cover_url: urlData.publicUrl });
    setMenuOpen(false);
  };

  if (loading) return <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}</div>;
  if (!playlist) return <EmptyState icon={<ListMusic className="w-8 h-8" />} title="Playlist not found" />;

  const isPlayingPlaylist = songs.some((s) => s.id === currentSong?.id) && isPlaying;
  const isOwner = profile?.id === playlist.user_id;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-base-hover shadow-2xl overflow-hidden flex items-center justify-center">
          {playlist.cover_url ? (
            <img src={playlist.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <ListMusic className="w-20 h-20 text-gray-600" />
          )}
        </div>
        <div className="text-center md:text-left flex-1">
          <p className="text-sm font-semibold text-gray-300 mb-2">Playlist</p>
          {editing ? (
            <div className="flex items-center gap-2 mb-4">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
                className="text-2xl md:text-4xl font-extrabold bg-transparent border-b-2 border-accent text-white focus:outline-none"
              />
              <button onClick={handleSaveName} className="text-accent font-semibold">Save</button>
            </div>
          ) : (
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{playlist.name}</h1>
          )}
          {playlist.description && <p className="text-sm text-gray-400 mb-2">{playlist.description}</p>}
          <p className="text-sm text-gray-300">{profile?.username} · {songs.length} songs</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => (isPlayingPlaylist ? togglePlay() : playQueue(songs))}
          disabled={songs.length === 0}
          className="w-14 h-14 rounded-full bg-accent flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isPlayingPlaylist ? <Pause className="w-6 h-6 text-black fill-black" /> : <Play className="w-6 h-6 text-black fill-black ml-1" />}
        </button>
        {isOwner && (
          <>
            <button onClick={() => { setEditName(playlist.name); setEditing(true); }} className="text-gray-400 hover:text-white">
              <Edit2 className="w-5 h-5" />
            </button>
            <button onClick={handleToggleFavorite} className={cn(playlist.is_favorite ? 'text-accent' : 'text-gray-400 hover:text-white')}>
              <Heart className={cn('w-5 h-5', playlist.is_favorite && 'fill-accent')} />
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-400 hover:text-white">
                <MoreHorizontal className="w-6 h-6" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-10 left-0 w-48 bg-base-elevated rounded-lg shadow-2xl py-1 z-50"
                  >
                    <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10">
                      <Upload className="w-4 h-4" /> Change cover
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                    <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/10">
                      <Trash2 className="w-4 h-4" /> Delete playlist
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Songs */}
      {songs.length === 0 ? (
        <EmptyState
          icon={<ListMusic className="w-8 h-8" />}
          title="This playlist is empty"
          description="Add songs to your playlist to get started."
          action={isOwner ? <button onClick={() => setShowAddModal(true)} className="btn-accent">Add Songs</button> : undefined}
        />
      ) : (
        <div className="space-y-1">
          {songs.map((song, i) => (
            <div key={song.id} className="group relative">
              <SongRow song={song} index={i} queue={songs} />
              {isOwner && (
                <button
                  onClick={() => handleRemoveSong(song.id)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2 mt-2 text-gray-400 hover:text-white text-sm"
            >
              <span className="w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center">+</span>
              Add more songs
            </button>
          )}
        </div>
      )}

      {/* Add songs modal */}
      <AnimatePresence>
        {showAddModal && <AddSongsModal playlistId={playlist.id} existingIds={new Set(songs.map((s) => s.id))} onClose={() => setShowAddModal(false)} onAdded={load} />}
      </AnimatePresence>
    </motion.div>
  );
}

function AddSongsModal({ playlistId, existingIds, onClose, onAdded }: { playlistId: string; existingIds: Set<string>; onClose: () => void; onAdded: () => void }) {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [filtered, setFiltered] = useState<Song[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    fetchSongs().then((s) => { setAllSongs(s); setFiltered(s); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(allSongs.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.artist?.name?.toLowerCase().includes(search.toLowerCase())));
  }, [search, allSongs]);

  const handleAdd = async (songId: string) => {
    setAdding(songId);
    const { error } = await supabase.from('playlist_songs').insert({ playlist_id: playlistId, song_id: songId, position: 0 });
    if (!error) onAdded();
    setAdding(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-base-elevated rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-lg font-bold">Add songs</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search songs..." className="w-full bg-base-bg border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No songs found</p>
          ) : (
            filtered.map((song) => {
              const exists = existingIds.has(song.id);
              return (
                <div key={song.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5">
                  <img src={song.cover_url || song.album?.cover_url || ''} alt="" className="w-10 h-10 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{song.title}</p>
                    <p className="text-xs text-gray-400 truncate">{song.artist?.name}</p>
                  </div>
                  <button
                    onClick={() => handleAdd(song.id)}
                    disabled={exists || adding === song.id}
                    className={cn('text-sm font-semibold px-4 py-1.5 rounded-full', exists ? 'text-gray-500' : 'text-accent border border-accent hover:bg-accent hover:text-black')}
                  >
                    {exists ? 'Added' : adding === song.id ? 'Adding...' : 'Add'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
