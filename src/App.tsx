import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { Player } from './components/Player';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { Loader2 } from 'lucide-react';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const LibraryPage = lazy(() => import('./pages/LibraryPage').then(m => ({ default: m.LibraryPage })));
const LikedSongsPage = lazy(() => import('./pages/LikedSongsPage').then(m => ({ default: m.LikedSongsPage })));
const RecentlyPlayedPage = lazy(() => import('./pages/RecentlyPlayedPage').then(m => ({ default: m.RecentlyPlayedPage })));
const PlaylistPage = lazy(() => import('./pages/PlaylistPage').then(m => ({ default: m.PlaylistPage })));
const AlbumPage = lazy(() => import('./pages/AlbumPage').then(m => ({ default: m.AlbumPage })));
const ArtistPage = lazy(() => import('./pages/ArtistPage').then(m => ({ default: m.ArtistPage })));
const GenrePage = lazy(() => import('./pages/GenrePage').then(m => ({ default: m.GenrePage })));
const AlbumsPage = lazy(() => import('./pages/AlbumsArtistsPage').then(m => ({ default: m.AlbumsPage })));
const ArtistsPage = lazy(() => import('./pages/AlbumsArtistsPage').then(m => ({ default: m.ArtistsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminUploadSong = lazy(() => import('./pages/admin/AdminUploadSong').then(m => ({ default: m.AdminUploadSong })));
const AdminPages = lazy(() => import('./pages/admin/AdminPages'));

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );
}

function AppRoutes() {
  // Initialize audio player hook at the top level
  useAudioPlayer();

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Suspense fallback={<Loading />}><LoginPage /></Suspense>} />
      <Route path="/signup" element={<Suspense fallback={<Loading />}><SignupPage /></Suspense>} />
      <Route path="/forgot-password" element={<Suspense fallback={<Loading />}><ForgotPasswordPage /></Suspense>} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Suspense fallback={<Loading />}><HomePage /></Suspense>} />
        <Route path="/search" element={<Suspense fallback={<Loading />}><SearchPage /></Suspense>} />
        <Route path="/library" element={<Suspense fallback={<Loading />}><LibraryPage /></Suspense>} />
        <Route path="/liked" element={<Suspense fallback={<Loading />}><LikedSongsPage /></Suspense>} />
        <Route path="/recently-played" element={<Suspense fallback={<Loading />}><RecentlyPlayedPage /></Suspense>} />
        <Route path="/playlist/:id" element={<Suspense fallback={<Loading />}><PlaylistPage /></Suspense>} />
        <Route path="/album/:id" element={<Suspense fallback={<Loading />}><AlbumPage /></Suspense>} />
        <Route path="/artist/:id" element={<Suspense fallback={<Loading />}><ArtistPage /></Suspense>} />
        <Route path="/genre/:id" element={<Suspense fallback={<Loading />}><GenrePage /></Suspense>} />
        <Route path="/albums" element={<Suspense fallback={<Loading />}><AlbumsPage /></Suspense>} />
        <Route path="/artists" element={<Suspense fallback={<Loading />}><ArtistsPage /></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<Loading />}><ProfilePage /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<Loading />}><SettingsPage /></Suspense>} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Suspense fallback={<Loading />}><AdminDashboard /></Suspense>} />
        <Route path="upload" element={<Suspense fallback={<Loading />}><AdminUploadSong /></Suspense>} />
        <Route path="songs" element={<Suspense fallback={<Loading />}><AdminPages.AdminSongs /></Suspense>} />
        <Route path="albums" element={<Suspense fallback={<Loading />}><AdminPages.AdminAlbums /></Suspense>} />
        <Route path="artists" element={<Suspense fallback={<Loading />}><AdminPages.AdminArtists /></Suspense>} />
        <Route path="genres" element={<Suspense fallback={<Loading />}><AdminPages.AdminGenres /></Suspense>} />
      </Route>

      <Route path="*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
