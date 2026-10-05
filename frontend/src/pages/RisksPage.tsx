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

const emptyRiskForm = {
  project_id: '',
  title: '',
  description: '',
  category: 'Delivery',
  probability: 3,
  impact: 3,
  severity: 'MEDIUM',
  mitigation_plan: '',
  contingency_plan: '',
  status: 'OPEN',
  due_date: '',
};

export function RisksPage() {
  const [risks, setRisks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyRiskForm);
  const [submitting, setSubmitting] = useState(false);

  const loadRisks = async () => {
    try {
      const [risksResponse, projectsResponse] = await Promise.all([
        api.get('/api/risks'),
        api.get('/api/projects'),
      ]);
      setRisks(risksResponse.data || []);
      setProjects(projectsResponse.data || []);
      if (!form.project_id && (projectsResponse.data || []).length > 0) {
        setForm((current) => ({ ...current, project_id: String((projectsResponse.data || [])[0].id) }));
      }
    } catch (error) {
      console.error('Failed to load risks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRisks();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post('/api/risks', {
        ...form,
        project_id: Number(form.project_id),
        probability: Number(form.probability),
        impact: Number(form.impact),
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category.trim(),
        mitigation_plan: form.mitigation_plan.trim() || null,
        contingency_plan: form.contingency_plan.trim() || null,
        due_date: form.due_date || null,
      });
      setRisks((current) => [response.data, ...current]);
      setForm({ ...emptyRiskForm, project_id: form.project_id });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create risk', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Risk register</h1>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">
          {showForm ? 'Close' : 'New risk'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Project</span>
              <select value={form.project_id} onChange={(event) => setForm((current) => ({ ...current, project_id: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" required>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Title</span>
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" required />
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Category</span>
              <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" required />
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Due date</span>
              <input type="date" value={form.due_date} onChange={(event) => setForm((current) => ({ ...current, due_date: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" />
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Probability</span>
              <select value={form.probability} onChange={(event) => setForm((current) => ({ ...current, probability: Number(event.target.value) }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500">
                {[1, 2, 3, 4, 5].map((value) => (<option key={value} value={value}>{value}</option>))}
              </select>
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Impact</span>
              <select value={form.impact} onChange={(event) => setForm((current) => ({ ...current, impact: Number(event.target.value) }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500">
                {[1, 2, 3, 4, 5].map((value) => (<option key={value} value={value}>{value}</option>))}
              </select>
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Severity</span>
              <select value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500">
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Status</span>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500">
                <option value="OPEN">OPEN</option>
                <option value="MITIGATING">MITIGATING</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </label>
            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="mb-1 block">Description</span>
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" />
            </label>
            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="mb-1 block">Mitigation plan</span>
              <textarea value={form.mitigation_plan} onChange={(event) => setForm((current) => ({ ...current, mitigation_plan: event.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" />
            </label>
            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="mb-1 block">Contingency plan</span>
              <textarea value={form.contingency_plan} onChange={(event) => setForm((current) => ({ ...current, contingency_plan: event.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" />
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={submitting} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? 'Saving...' : 'Create risk'}
            </button>
          </div>
        </form>
      )}

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
