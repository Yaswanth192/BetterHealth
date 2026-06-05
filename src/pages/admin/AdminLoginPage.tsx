import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLoginPage() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!loading && user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const { error: err } = await signIn(email, password);
    if (err) {
      setError('Invalid email or password. Please try again.');
    } else {
      navigate('/admin/dashboard');
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-teal-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">MediCare Admin</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/60">Sign in to access your clinic dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@clinic.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-white hover:bg-white/90 text-primary-700 font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Admin access only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
