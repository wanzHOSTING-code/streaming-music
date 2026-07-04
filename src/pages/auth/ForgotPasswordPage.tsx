import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Music, Mail, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

type FormData = { email: string };

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setError(null);
    const { error } = await resetPassword(data.email);
    if (error) setError(error);
    else setSent(true);
  };

  return (
    <div className="min-h-screen bg-base-bg flex flex-col items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <Music className="w-7 h-7 text-black" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight">Wave Music</span>
        </div>

        <div className="bg-base-card rounded-2xl p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-2">Reset password</h1>
          <p className="text-gray-400 mb-6">We'll send you a link to reset your password</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {sent ? (
            <div className="flex flex-col items-center text-center py-4">
              <CheckCircle className="w-12 h-12 text-accent mb-4" />
              <p className="text-white font-semibold mb-2">Check your email</p>
              <p className="text-sm text-gray-400 mb-6">We've sent a password reset link to your email address.</p>
              <button onClick={() => navigate('/login')} className="btn-accent">Back to Login</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full bg-base-bg border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="w-full btn-accent flex items-center justify-center gap-2 disabled:opacity-50">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Reset Link
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-400 mt-6">
            <Link to="/login" className="text-accent hover:underline font-semibold">Back to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
