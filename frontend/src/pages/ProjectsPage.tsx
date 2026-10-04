import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const statusClasses: Record<string, string> = {
  PLANNING: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-cyan-100 text-cyan-700',
  AT_RISK: 'bg-amber-100 text-amber-700',
  BLOCKED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
};

const priorityClasses: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const emptyProjectForm = {
  name: '',
  key: '',
  description: '',
  status: 'PLANNING',
  priority: 'MEDIUM',
};

export function ProjectsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyProjectForm);
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      setRows(response.data || []);
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        key: form.key.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
      };

      const response = await api.post('/api/projects', payload);
      setRows((current) => [response.data, ...current]);
      setForm(emptyProjectForm);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create project', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">
          {showForm ? 'Close' : 'New project'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Project name</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" required />
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Key</span>
              <input value={form.key} onChange={(event) => setForm((current) => ({ ...current, key: event.target.value.toUpperCase() }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" required />
            </label>
            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="mb-1 block">Description</span>
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" />
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Status</span>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500">
                <option value="PLANNING">PLANNING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="AT_RISK">AT_RISK</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Priority</span>
              <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500">
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={submitting} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? 'Saving...' : 'Create project'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading projects…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No projects found.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link to={`/projects/${row.id}`} className="text-cyan-700 hover:text-cyan-600">
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.key}</td>
                  <td className="px-4 py-3 text-slate-600">{row.owner_id ?? 'Unassigned'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses[row.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityClasses[row.priority] ?? 'bg-slate-100 text-slate-700'}`}>
                      {row.priority}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
