import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const statusOrder = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

const emptyTaskForm = {
  project_id: '',
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
};

export function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyTaskForm);
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = async () => {
    try {
      const [tasksResponse, projectsResponse] = await Promise.all([
        api.get('/api/tasks'),
        api.get('/api/projects'),
      ]);
      setTasks(tasksResponse.data || []);
      setProjects(projectsResponse.data || []);
      if (!form.project_id && (projectsResponse.data || []).length > 0) {
        setForm((current) => ({ ...current, project_id: String((projectsResponse.data || [])[0].id) }));
      }
    } catch (error) {
      console.error('Failed to load tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  const lanes = useMemo(
    () =>
      statusOrder.map((status) => ({
        name: status,
        tasks: tasks.filter((task) => task.status === status),
      })),
    [tasks],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post('/api/tasks', {
        ...form,
        project_id: Number(form.project_id),
        title: form.title.trim(),
        description: form.description.trim() || null,
      });
      setTasks((current) => [response.data, ...current]);
      setForm({ ...emptyTaskForm, project_id: form.project_id });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create task', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: number, nextStatus: string) => {
    const task = tasks.find((entry) => entry.id === taskId);
    if (!task || task.status === nextStatus) {
      return;
    }

    try {
      const response = await api.put(`/api/tasks/${taskId}`, {
        ...task,
        status: nextStatus,
      });
      setTasks((current) => current.map((entry) => (entry.id === taskId ? response.data : entry)));
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">
          {showForm ? 'Close' : 'New task'}
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
            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="mb-1 block">Description</span>
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500" />
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block">Status</span>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-cyan-500">
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="DONE">DONE</option>
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
              {submitting ? 'Saving...' : 'Create task'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Loading tasks…</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          {lanes.map((lane) => (
            <div key={lane.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">{lane.name}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{lane.tasks.length}</span>
              </div>
              <div className="space-y-3">
                {lane.tasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-400">No tasks</div>
                ) : (
                  lane.tasks.map((task) => (
                    <div key={task.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      <div className="font-medium text-slate-800">{task.title}</div>
                      <div className="mt-1 text-xs text-slate-500">Project #{task.project_id}</div>
                      <div className="mt-3">
                        <label className="text-[11px] uppercase tracking-wide text-slate-500">Status</label>
                        <select
                          value={task.status}
                          onChange={(event) => handleStatusChange(task.id, event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-cyan-500"
                        >
                          {statusOrder.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
