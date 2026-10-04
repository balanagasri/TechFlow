import { Bell, BarChart3, Briefcase, Boxes, LayoutDashboard, LogOut, Search, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../services/api';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: Briefcase },
  { to: '/tasks', label: 'Tasks', icon: Target },
  { to: '/risks', label: 'Risks', icon: ShieldCheck },
  { to: '/releases', label: 'Releases', icon: TrendingUp },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Boxes },
];

export function Layout() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await api.get('/api/notifications');
        setNotifications(response.data || []);
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };

    void loadNotifications();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await api.get('/api/search', { params: { q: searchQuery } });
        const results = [...(response.data?.projects || []), ...(response.data?.tasks || [])];
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed', error);
        setSearchResults([]);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('techflow_token');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      <aside className="w-72 bg-slate-900 p-6 text-slate-100">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 font-bold">T</div>
          <div>
            <div className="text-xl font-bold">TECHFLOW</div>
            <div className="text-xs text-slate-400">Program Management</div>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="relative flex items-center gap-3">
            <Search className="absolute left-3 text-slate-400" size={16} />
            <input
              aria-label="Global search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-96 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-cyan-500"
              placeholder="Search projects, tasks, risks..."
            />
            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="absolute left-0 top-12 z-20 w-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                {searchResults.slice(0, 5).map((result) => (
                  <div key={`${result.type}-${result.id}`} className="border-b border-slate-100 px-3 py-2 text-sm last:border-b-0">
                    <div className="font-medium text-slate-800">{result.name}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{result.type}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="relative rounded-full border border-slate-200 p-2 text-slate-600" aria-label="Notifications">
                <Bell size={18} />
                {notifications.length > 0 && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />}
              </button>
              {notifications.length > 0 && (
                <div className="absolute right-0 top-12 z-20 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  {notifications.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-lg bg-slate-50 px-3 py-2 text-left text-sm">
                      <div className="font-medium text-slate-800">{item.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">AD</div>
              <div>
                <div className="text-sm font-semibold">Admin</div>
                <div className="text-xs text-slate-500">ADMIN</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
