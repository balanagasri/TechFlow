import { useEffect, useState } from 'react';
import api from '../services/api';

export function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to load user settings', error);
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="text-slate-500">Loading settings…</div>
        ) : (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span>Current user</span><span className="font-semibold">{user?.name || 'Unknown'}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span>Role</span><span className="font-semibold">{user?.role || 'VIEWER'}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span>Default project view</span><span className="font-semibold">Portfolio</span></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span>Release notifications</span><span className="font-semibold">Enabled</span></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span>Risk escalation policy</span><span className="font-semibold">Critical</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
