import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await api.get(`/api/projects/${projectId}`);
        setProject(response.data);
      } catch (error) {
        console.error('Failed to load project', error);
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [projectId]);

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Loading project…</div>;
  }

  if (!project) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">Project</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{project.name}</h1>
        </div>
        <Link to="/projects" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">Back to projects</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-700">{project.key}</span>
            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">{project.status}</span>
            <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700">{project.priority}</span>
          </div>
          <p className="text-slate-600">{project.description || 'No description provided.'}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</div>
              <div className="mt-2 font-semibold text-slate-900">{project.owner_id ?? 'Unassigned'}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Start</div>
              <div className="mt-2 font-semibold text-slate-900">{project.start_date || '—'}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Target</div>
              <div className="mt-2 font-semibold text-slate-900">{project.target_date || '—'}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Program health</h2>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                <span>Delivery</span>
                <span>72%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200">
                <div className="h-2.5 w-[72%] rounded-full bg-cyan-500" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                <span>Risk</span>
                <span>38%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200">
                <div className="h-2.5 w-[38%] rounded-full bg-amber-500" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                <span>Milestones</span>
                <span>80%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200">
                <div className="h-2.5 w-[80%] rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
