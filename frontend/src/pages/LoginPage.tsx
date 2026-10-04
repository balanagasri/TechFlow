import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function LoginPage() {
  const [email, setEmail] = useState('admin@techflow.dev');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('techflow_token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-100 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-2xl font-bold text-white">T</div>
          <h1 className="text-2xl font-bold">TECHFLOW</h1>
          <p className="mt-2 text-sm text-slate-400">Engineering program management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 outline-none focus:border-cyan-500" />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 outline-none focus:border-cyan-500" />
          </label>
          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
          <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-white hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
