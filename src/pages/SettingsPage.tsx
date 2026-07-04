import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export function SettingsPage() {
  const navigate = useNavigate();
  const { profile, refreshProfile, signOut } = useAuthStore();
  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      username: username.trim(),
      full_name: fullName.trim(),
      bio: bio.trim(),
    }).eq('id', profile.id);
    if (!error) {
      refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto pb-8">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-6">Settings</h1>

      <div className="bg-base-card rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5" /> Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-base-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-base-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full bg-base-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none" />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-accent flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-base-card rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Account</h2>
        <p className="text-sm text-gray-400 mb-4">{profile?.username || 'User'}</p>
        <button onClick={handleSignOut} className="flex items-center gap-2 text-red-400 hover:text-red-300 font-semibold">
          <LogOut className="w-5 h-5" /> Sign out
        </button>
      </div>
    </motion.div>
  );
}
