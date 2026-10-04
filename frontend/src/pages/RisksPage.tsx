import { useEffect, useState } from 'react';
import api from '../services/api';

const severityClasses: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const statusClasses: Record<string, string> = {
  OPEN: 'bg-sky-100 text-sky-700',
  MITIGATING: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-200 text-slate-700',
};

export function RisksPage() {
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRisks = async () => {
      try {
        const response = await api.get('/api/risks');
        setRisks(response.data || []);
      } catch (error) {
        console.error('Failed to load risks', error);
      } finally {
        setLoading(false);
      }
    };

    void loadRisks();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">Risk register</h1>
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Loading risks…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {risks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500 md:col-span-3">
              No risks found.
            </div>
          ) : (
            risks.map((risk) => (
              <div key={risk.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-slate-900">{risk.title}</h2>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${severityClasses[risk.severity] ?? 'bg-slate-100 text-slate-700'}`}>
                    {risk.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Project #{risk.project_id}</p>
                <p className="mt-3 text-sm text-slate-600">Status: <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses[risk.status] ?? 'bg-slate-100 text-slate-700'}`}>{risk.status}</span></p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
