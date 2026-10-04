import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, CircleAlert, FolderKanban, TriangleAlert } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import api from '../services/api';

const chartColors = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const defaultSummary = [
  { label: 'Total Projects', value: 0, tone: 'bg-cyan-500' },
  { label: 'Active Projects', value: 0, tone: 'bg-emerald-500' },
  { label: 'At-Risk', value: 0, tone: 'bg-amber-500' },
  { label: 'Blocked', value: 0, tone: 'bg-red-500' },
  { label: 'Completed', value: 0, tone: 'bg-violet-500' },
];

const defaultTaskStatusData = [
  { name: 'Todo', value: 0 },
  { name: 'In Progress', value: 0 },
  { name: 'Review', value: 0 },
  { name: 'Testing', value: 0 },
  { name: 'Done', value: 0 },
];

export function DashboardPage() {
  const [summary, setSummary] = useState(defaultSummary);
  const [taskStatusData, setTaskStatusData] = useState(defaultTaskStatusData);
  const [projectStatusData, setProjectStatusData] = useState([
    { name: 'Planning', value: 0 },
    { name: 'In Progress', value: 0 },
    { name: 'At Risk', value: 0 },
    { name: 'Blocked', value: 0 },
    { name: 'Completed', value: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryResponse, projectsResponse] = await Promise.all([
          api.get('/api/dashboard/summary'),
          api.get('/api/projects'),
        ]);

        const summaryData = summaryResponse.data;
        setSummary([
          { label: 'Total Projects', value: summaryData.total_projects, tone: 'bg-cyan-500' },
          { label: 'Active Projects', value: summaryData.active_projects, tone: 'bg-emerald-500' },
          { label: 'At-Risk', value: summaryData.at_risk_projects, tone: 'bg-amber-500' },
          { label: 'Blocked', value: summaryData.blocked_projects, tone: 'bg-red-500' },
          { label: 'Completed', value: summaryData.completed_projects, tone: 'bg-violet-500' },
        ]);

        const projects = Array.isArray(projectsResponse.data) ? projectsResponse.data : [];
        const projectCounts = {
          PLANNING: 0,
          IN_PROGRESS: 0,
          AT_RISK: 0,
          BLOCKED: 0,
          COMPLETED: 0,
        };

        projects.forEach((project: { status: string }) => {
          if (project.status in projectCounts) {
            projectCounts[project.status as keyof typeof projectCounts] += 1;
          }
        });

        setProjectStatusData([
          { name: 'Planning', value: projectCounts.PLANNING },
          { name: 'In Progress', value: projectCounts.IN_PROGRESS },
          { name: 'At Risk', value: projectCounts.AT_RISK },
          { name: 'Blocked', value: projectCounts.BLOCKED },
          { name: 'Completed', value: projectCounts.COMPLETED },
        ]);

        setTaskStatusData([
          { name: 'Todo', value: summaryData.open_tasks || 0 },
          { name: 'In Progress', value: 0 },
          { name: 'Review', value: 0 },
          { name: 'Testing', value: 0 },
          { name: 'Done', value: summaryData.completed_tasks || 0 },
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const isEmpty = useMemo(() => summary.every((item) => item.value === 0), [summary]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-700">Overview</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Engineering program dashboard</h1>
        </div>
        <button className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500">Generate report</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summary.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-4 h-2.5 w-12 rounded-full ${item.tone}`} />
            <div className="text-3xl font-bold text-slate-900">{loading && item.value === 0 ? '—' : item.value}</div>
            <div className="mt-2 text-sm text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Project status distribution</h2>
            <ArrowUpRight className="text-cyan-600" size={18} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStatusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Task status</h2>
            <FolderKanban className="text-violet-600" size={18} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-slate-900">
            <TriangleAlert className="text-amber-500" size={18} />
            <h2 className="text-lg font-semibold">Open risks</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2"><span>Payment batch outage</span><span className="font-semibold text-amber-600">HIGH</span></div>
            <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2"><span>Identity token expiry</span><span className="font-semibold text-red-600">CRITICAL</span></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-slate-900">
            <CircleAlert className="text-red-500" size={18} />
            <h2 className="text-lg font-semibold">Open blockers</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2"><span>Vault API access</span><span className="font-semibold text-red-600">4 days</span></div>
            <div className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2"><span>Legacy event parity</span><span className="font-semibold text-orange-600">2 days</span></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-slate-900">
            <CheckCircle2 className="text-emerald-500" size={18} />
            <h2 className="text-lg font-semibold">Upcoming releases</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-emerald-50 px-3 py-2"><div className="font-semibold text-emerald-700">Portal 2.6.0</div><div className="text-slate-500">Nov 14, 2026</div></div>
            <div className="rounded-lg bg-sky-50 px-3 py-2"><div className="font-semibold text-sky-700">Auth Service 3.1.0</div><div className="text-slate-500">Nov 20, 2026</div></div>
          </div>
        </div>
      </div>

      {!loading && isEmpty && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          No dashboard data is available yet. Log in again and verify the backend is running on localhost:8000.
        </div>
      )}
    </div>
  );
}
