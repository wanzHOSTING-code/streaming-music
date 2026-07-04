import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Music, Image, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

type FormData = {
  title: string;
  artist_name: string;
  album_title: string;
  genre_name: string;
  lyrics: string;
  release_date: string;
  description: string;
};

export function AdminUploadSong() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingMp3, setDraggingMp3] = useState(false);
  const [draggingCover, setDraggingCover] = useState(false);
  const mp3Ref = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // Load options on mount
  useState(() => {
    Promise.all([
      supabase.from('artists').select('id,name').order('name'),
      supabase.from('albums').select('id,title').order('title'),
      supabase.from('genres').select('id,name').order('name'),
    ]).then(([a, al, g]) => {
      setArtists(a.data || []);
      setAlbums(al.data || []);
      setGenres(g.data || []);
    });
  });

  const handleMp3 = useCallback((file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }
    setError(null);
    setMp3File(file);
    // Calculate duration
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      setDuration(Math.round(audio.duration));
    };
    audio.src = URL.createObjectURL(file);
  }, []);

  const handleCover = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setError(null);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }, []);

  const onDrop = (e: React.DragEvent, type: 'mp3' | 'cover') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (type === 'mp3') { setDraggingMp3(false); handleMp3(file); }
    else { setDraggingCover(false); handleCover(file); }
  };

  const onSubmit = async (data: FormData) => {
    if (!mp3File) { setError('Please select an MP3 file'); return; }
    setUploading(true);
    setError(null);
    try {
      // 1. Upload MP3
      const mp3Path = `songs/${Date.now()}-${mp3File.name}`;
      const { error: mp3Err } = await supabase.storage.from('songs').upload(mp3Path, mp3File);
      if (mp3Err) throw new Error('MP3 upload failed: ' + mp3Err.message);
      const { data: mp3UrlData } = supabase.storage.from('songs').getPublicUrl(mp3Path);

      // 2. Upload cover if provided
      let coverUrl = '';
      if (coverFile) {
        const coverPath = `covers/${Date.now()}-${coverFile.name}`;
        const { error: coverErr } = await supabase.storage.from('covers').upload(coverPath, coverFile);
        if (coverErr) throw new Error('Cover upload failed: ' + coverErr.message);
        const { data: coverUrlData } = supabase.storage.from('covers').getPublicUrl(coverPath);
        coverUrl = coverUrlData.publicUrl;
      }

      // 3. Find or create artist
      let artistId = artists.find((a) => a.name === data.artist_name)?.id;
      if (!artistId && data.artist_name) {
        const { data: newArtist } = await supabase.from('artists').insert({ name: data.artist_name }).select('id').single();
        artistId = newArtist?.id;
      }

      // 4. Find or create album
      let albumId = albums.find((a) => a.title === data.album_title)?.id;
      if (!albumId && data.album_title) {
        const { data: newAlbum } = await supabase.from('albums').insert({
          title: data.album_title,
          artist_id: artistId,
          cover_url: coverUrl || null,
          release_date: data.release_date || null,
        }).select('id').single();
        albumId = newAlbum?.id;
      }

      // 5. Find or create genre
      let genreId = genres.find((g) => g.name === data.genre_name)?.id;
      if (!genreId && data.genre_name) {
        const { data: newGenre } = await supabase.from('genres').insert({ name: data.genre_name }).select('id').single();
        genreId = newGenre?.id;
      }

      // 6. Insert song
      const { error: songErr } = await supabase.from('songs').insert({
        title: data.title,
        artist_id: artistId || null,
        album_id: albumId || null,
        genre_id: genreId || null,
        audio_url: mp3UrlData.publicUrl,
        cover_url: coverUrl || null,
        duration,
        lyrics: data.lyrics || null,
        release_date: data.release_date || null,
        description: data.description || null,
      });
      if (songErr) throw new Error('Failed to save song: ' + songErr.message);

      setSuccess(true);
      reset();
      setMp3File(null);
      setCoverFile(null);
      setCoverPreview('');
      setDuration(0);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-2">Upload Song</h1>
      <p className="text-gray-400 mb-6">Add a new song to the catalog</p>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-lg p-3 mb-4 text-accent">
          <CheckCircle className="w-5 h-5" /> Song uploaded successfully!
        </motion.div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-400">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* MP3 dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDraggingMp3(true); }}
          onDragLeave={() => setDraggingMp3(false)}
          onDrop={(e) => onDrop(e, 'mp3')}
          onClick={() => mp3Ref.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors',
            draggingMp3 ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-white/20'
          )}
        >
          <input ref={mp3Ref} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleMp3(e.target.files[0])} />
          {mp3File ? (
            <div className="flex items-center justify-center gap-3">
              <Music className="w-8 h-8 text-accent" />
              <div className="text-left">
                <p className="font-semibold">{mp3File.name}</p>
                <p className="text-sm text-gray-400">Duration: {formatDuration(duration)}</p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setMp3File(null); setDuration(0); }} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="font-semibold mb-1">Drop MP3 file here</p>
              <p className="text-sm text-gray-400">or click to browse</p>
            </>
          )}
        </div>

        {/* Cover dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDraggingCover(true); }}
          onDragLeave={() => setDraggingCover(false)}
          onDrop={(e) => onDrop(e, 'cover')}
          onClick={() => coverRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors',
            draggingCover ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-white/20'
          )}
        >
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleCover(e.target.files[0])} />
          {coverPreview ? (
            <div className="flex items-center justify-center gap-3">
              <img src={coverPreview} alt="" className="w-16 h-16 rounded-lg object-cover" />
              <button type="button" onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(''); }} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <Image className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Drop cover image or click to browse</p>
            </>
          )}
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Song Title *</label>
            <input {...register('title', { required: 'Title is required' })} className="w-full bg-base-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Artist Name *</label>
            <input list="artists-list" {...register('artist_name', { required: 'Artist is required' })} className="w-full bg-base-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
            <datalist id="artists-list">
              {artists.map((a) => <option key={a.id} value={a.name} />)}
            </datalist>
            {errors.artist_name && <p className="text-xs text-red-400 mt-1">{errors.artist_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Album</label>
            <input list="albums-list" {...register('album_title')} className="w-full bg-base-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
            <datalist id="albums-list">
              {albums.map((a) => <option key={a.id} value={a.title} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Genre</label>
            <input list="genres-list" {...register('genre_name')} className="w-full bg-base-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
            <datalist id="genres-list">
              {genres.map((g) => <option key={g.id} value={g.name} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Release Date</label>
            <input type="date" {...register('release_date')} className="w-full bg-base-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Lyrics</label>
            <textarea {...register('lyrics')} rows={4} className="w-full bg-base-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea {...register('description')} rows={2} className="w-full bg-base-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none" />
          </div>
        </div>

        <button type="submit" disabled={uploading} className="btn-accent flex items-center gap-2 disabled:opacity-50">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload Song'}
        </button>
      </form>
    </div>
  );
}
