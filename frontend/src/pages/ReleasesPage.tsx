import { useEffect, useState } from 'react';
import api from '../services/api';

const statusClasses: Record<string, string> = {
  PLANNED: 'bg-slate-100 text-slate-700',
  DEVELOPMENT: 'bg-cyan-100 text-cyan-700',
  QA: 'bg-violet-100 text-violet-700',
  READY_FOR_RELEASE: 'bg-emerald-100 text-emerald-700',
  RELEASED: 'bg-emerald-200 text-emerald-800',
};

export function ReleasesPage() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReleases = async () => {
      try {
        const response = await api.get('/api/releases');
        setReleases(response.data || []);
      } catch (error) {
        console.error('Failed to load releases', error);
      } finally {
        setLoading(false);
      }
    };

    void loadReleases();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">Releases</h1>
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Loading releases…</div>
      ) : (
        <div className="space-y-3">
          {releases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">No releases found.</div>
          ) : (
            releases.map((release) => (
              <div key={release.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{release.name}</div>
                    <div className="text-sm text-slate-500">{release.version} · {release.environment}</div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses[release.status] ?? 'bg-slate-100 text-slate-700'}`}>
                    {release.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
