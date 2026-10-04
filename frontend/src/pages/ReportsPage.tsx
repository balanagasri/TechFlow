import { useEffect, useState } from 'react';
import api from '../services/api';

export function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await api.get('/api/dashboard/summary');
        setSummary(response.data);
      } catch (error) {
        console.error('Failed to load report summary', error);
      } finally {
        setLoading(false);
      }
    };

    void loadSummary();
  }, []);

  const deliveryPct = summary
    ? Math.min(100, Math.max(0, Math.round(((summary.completed_tasks || 0) / Math.max((summary.open_tasks || 0) + (summary.completed_tasks || 0), 1)) * 100)))
    : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">Weekly status report</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-sm uppercase tracking-[0.2em] text-cyan-700">Program summary</div>
        <h2 className="text-2xl font-bold text-slate-900">
          {loading ? 'Loading program health…' : `Overall health is ${summary && summary.at_risk_projects ? 'AT RISK' : 'STABLE'}`}
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Progress</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{loading ? '—' : `${deliveryPct}%`}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Completed work</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{loading ? '—' : `${summary?.completed_tasks ?? 0} tasks`}</div>
          </div>
        </div>

        {!loading && summary && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-cyan-50 p-4 text-sm text-cyan-900">
              <div className="text-cyan-700">Projects</div>
              <div className="mt-1 text-2xl font-bold">{summary.total_projects}</div>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              <div className="text-amber-700">At risk</div>
              <div className="mt-1 text-2xl font-bold">{summary.at_risk_projects}</div>
            </div>
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-900">
              <div className="text-red-700">Blocked</div>
              <div className="mt-1 text-2xl font-bold">{summary.blocked_projects}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
