const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('tf_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return data as T;
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; name: string }) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify(body) }
      ),
    login: (body: { email: string; password: string }) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify(body) }
      ),
  },
  flags: {
    getAll: () => request<Record<string, boolean>>('/flags'),
  },
  tasks: {
    getAll: () => request<Task[]>('/tasks'),
    create: (body: Partial<Task>) =>
      request<Task>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Task>) =>
      request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' }),
    exportCsv: () =>
      fetch(`${BASE}/tasks/export/csv`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      }),
    getComments: (taskId: string) => request<Comment[]>(`/tasks/${taskId}/comments`),
    addComment: (taskId: string, text: string) =>
      request<Comment>(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),
  },
  dashboard: {
    getStats: () => request<DashboardStats>('/dashboard'),
  },
  collaboration: {
    share: (taskId: string, shareWithEmail: string) =>
      request<{ message: string }>('/collaboration/share', {
        method: 'POST',
        body: JSON.stringify({ taskId, shareWithEmail }),
      }),
  },
};

// ── Shared types ─────────────────────────────────────────────────────────────
export interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  labels: string[];
  owner: string;
  sharedWith: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  task: string;
  author: { _id: string; name: string; email: string };
  text: string;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  overdue: number;
  byPriority: { low: number; medium: number; high: number };
  topLabels: { label: string; count: number }[];
  totalComments: number;
}
