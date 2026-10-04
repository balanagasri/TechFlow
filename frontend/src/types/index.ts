export type Role = 'ADMIN' | 'PROGRAM_MANAGER' | 'ENGINEER' | 'VIEWER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface DashboardSummary {
  total_projects: number;
  active_projects: number;
  at_risk_projects: number;
  blocked_projects: number;
  completed_projects: number;
  open_tasks: number;
  completed_tasks: number;
}
