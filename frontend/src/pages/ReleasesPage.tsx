import { useEffect, useState } from 'react';
import api from '../services/api';

const statusClasses: Record<string, string> = {
  PLANNED: 'bg-slate-100 text-slate-700',
  DEVELOPMENT: 'bg-cyan-100 text-cyan-700',
  QA: 'bg-violet-100 text-violet-700',
  READY_FOR_RELEASE: 'bg-emerald-100 text-emerald-700',
  RELEASED: 'bg-emerald-200 text-emerald-800',
};

const emptyReleaseForm = {
  project_id: '',
  name: '',
  version: '',
  description: '',
  planned_date: '',
  actual_date: '',
  status: 'PLANNED',
  environment: 'DEV',
};

export function ReleasesPage() {
  const [releases, setReleases] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyReleaseForm);
  const [submitting, setSubmitting] = useState(false);

  const loadReleases = async () => {
    try {
      const [releasesResponse, projectsResponse] = await Promise.all([
        api.get('/api/releases'),
        api.get('/api/projects'),
      ]);
      setReleases(releasesResponse.data || []);
      setProjects(projectsResponse.data || []);
      if (!form.project_id && (projectsResponse.data || []).length > 0) {
        setForm((current) => ({ ...current, project_id: String((projectsResponse.data || [])[0].id) }));
      }
    } catch (error) {
      console.error('Failed to load releases', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReleases();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post('/api/releases', {
        ...form,
        project_id: Number(form.project_id),
        version: form.version.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        planned_date: form.planned_date || null,
        actual_date: form.actual_date || null,
      });
      setReleases((current) => [response.data, ...current]);
      setForm({ ...emptyReleaseForm, project_id: form.project_id });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create release', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Releases</h1>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">
          {showForm ? 'Close' : 'New release'}
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
              <span className="mb-1 block">Version</span>
              <input value={form.version} onChange={(event) => setForm((current) => ({ ...current, version: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" required />
            </label>
            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="mb-1 block">Release name</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" required />
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Status</span>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500">
                <option value="PLANNED">PLANNED</option>
                <option value="DEVELOPMENT">DEVELOPMENT</option>
                <option value="QA">QA</option>
                <option value="READY_FOR_RELEASE">READY_FOR_RELEASE</option>
                <option value="RELEASED">RELEASED</option>
              </select>
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Environment</span>
              <select value={form.environment} onChange={(event) => setForm((current) => ({ ...current, environment: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500">
                <option value="DEV">DEV</option>
                <option value="STAGING">STAGING</option>
                <option value="PROD">PROD</option>
              </select>
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Planned date</span>
              <input type="date" value={form.planned_date} onChange={(event) => setForm((current) => ({ ...current, planned_date: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" />
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Actual date</span>
              <input type="date" value={form.actual_date} onChange={(event) => setForm((current) => ({ ...current, actual_date: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" />
            </label>
            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="mb-1 block">Description</span>
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" />
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={submitting} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? 'Saving...' : 'Create release'}
            </button>
          </div>
        </form>
      )}

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
