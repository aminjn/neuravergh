// کلاینت API پنل سوپر‌ادمین — به همان بک‌اند Neura وصل می‌شود (/api)
const BASE = (import.meta as any).env?.VITE_API_BASE || '/api';
const TOKEN_KEY = 'aw-token';

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(t: string | null) {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {}
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

async function req<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as any) };
  if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, data?.error || res.statusText);
  return data as T;
}

export interface AuthUser {
  id: string | number; username: string; name?: string; email?: string;
  role: 'user' | 'admin' | 'superadmin'; company?: string;
}

export const api = {
  health: () => req('/health'),
  login: (username: string, password: string) =>
    req<{ token: string; user: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => req<{ user: AuthUser }>('/auth/me'),
  getSettings: <T = any>() => req<T>('/settings'),
  putSettings: <T = any>(patch: Partial<T>) => req<T>('/settings', { method: 'PUT', body: JSON.stringify(patch) }),
  list: <T = any>(c: string, company?: string) => req<T[]>(`/data/${c}${company ? `?company=${encodeURIComponent(company)}` : ''}`),
  create: <T = any>(c: string, data: Partial<T>) => req<T>(`/data/${c}`, { method: 'POST', body: JSON.stringify(data) }),
  update: <T = any>(c: string, id: string, patch: Partial<T>) => req<T>(`/data/${c}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(patch) }),
  remove: (c: string, id: string) => req(`/data/${c}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  listUsers: (p: { q?: string; limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (p.q) qs.set('q', p.q);
    if (p.limit != null) qs.set('limit', String(p.limit));
    if (p.offset != null) qs.set('offset', String(p.offset));
    const s = qs.toString();
    return req<{ items: AuthUser[]; total: number; limit: number; offset: number }>(`/users${s ? `?${s}` : ''}`);
  },
  createUser: (u: Partial<AuthUser> & { password: string; meta?: any }) => req<AuthUser>('/users', { method: 'POST', body: JSON.stringify(u) }),
  updateUser: (id: string | number, patch: Partial<AuthUser> & { password?: string; meta?: any }) => req<AuthUser>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  deleteUser: (id: string | number) => req(`/users/${id}`, { method: 'DELETE' }),

  // AI providers / models
  syncProvider: (id: string) => req<{ ok: boolean; total: number; added: number; updated: number }>(`/ai/providers/${id}/sync`, { method: 'POST' }),
  testModel: (body: { providerId: string; model: string; prompt?: string }) =>
    req<{ ok: boolean; text: string }>(`/ai/test`, { method: 'POST', body: JSON.stringify(body) }),
  generateImage: (body: { providerId: string; model: string; prompt: string; size?: string }) =>
    req<{ ok: boolean; url: string | null }>(`/ai/image`, { method: 'POST', body: JSON.stringify(body) }),

  // VoIP / تماس (Asterisk ARI)
  voipTest: () => req<{ ok: boolean; version?: string; error?: string; detail?: any; status?: number }>('/voip/test', { method: 'POST' }),
  voipCall: (body: { agentId?: string; agentName?: string; targetName?: string; targetNumber?: string; purpose?: string; requestedBy?: string }) =>
    req<{ ok: boolean; task?: any; reason?: string; originate?: any }>('/voip/call', { method: 'POST', body: JSON.stringify(body) }),
  voipStatus: (id: string) => req<{ ok: boolean; status: string; asterisk?: any }>(`/voip/calls/${encodeURIComponent(id)}/status`),
  voipHangup: (id: string) => req<{ ok: boolean }>(`/voip/calls/${encodeURIComponent(id)}/hangup`, { method: 'POST' }),

  // Admin activity logs
  listLogs: (p: { limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (p.limit != null) qs.set('limit', String(p.limit));
    if (p.offset != null) qs.set('offset', String(p.offset));
    const s = qs.toString();
    return req<{ items: any[]; total: number }>(`/logs${s ? `?${s}` : ''}`);
  },
};
