// 맘케어 백엔드 API 클라이언트 (바닐라 api.js의 TS 포팅)
// 클라이언트 전용 (localStorage 사용) — 'use client' 컴포넌트에서 호출

const MC_API_LOCAL = 'http://localhost:3000/api';
const MC_API_PROD = 'https://momcare-api-9qr2.onrender.com/api';

function apiBase(): string {
  if (typeof window === 'undefined') return MC_API_PROD;
  const h = window.location.hostname;
  const isLocal = ['localhost', '127.0.0.1', ''].includes(h) || window.location.protocol === 'file:';
  return isLocal ? MC_API_LOCAL : MC_API_PROD;
}

export const MC_DEMO_ACCOUNTS: Record<string, { phone: string; password: string }> = {
  parent: { phone: '010-1111-1111', password: 'test1234' },
  worker: { phone: '010-2222-0001', password: 'test1234' },
  admin: { phone: '010-0000-0000', password: 'test1234' },
};

export interface AuthUserInfo {
  id: string;
  role: 'PARENT' | 'WORKER' | 'ADMIN';
  name: string;
  phone?: string;
}

const TOKEN_KEY = 'mc_token';
const USER_KEY = 'mc_user';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function post<T = any>(path: string, body?: any): Promise<T> {
  const r = await fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const msg = await r.json().catch(() => ({}));
    throw new Error((msg as any).message || `POST ${path} → ${r.status}`);
  }
  return r.json();
}

async function get<T = any>(path: string): Promise<T> {
  const r = await fetch(`${apiBase()}${path}`, { headers: authHeaders() });
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return r.json();
}

async function del<T = any>(path: string): Promise<T> {
  const r = await fetch(`${apiBase()}${path}`, { method: 'DELETE', headers: authHeaders() });
  if (!r.ok) throw new Error(`DELETE ${path} → ${r.status}`);
  return r.json();
}

export const api = {
  // ---- 세션 ----
  getUser(): AuthUserInfo | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUserInfo) : null;
  },
  isLoggedIn(): boolean {
    return !!getToken();
  },
  setSession(token: string, user: AuthUserInfo) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // ---- 서버 생존 확인 ----
  async check(): Promise<boolean> {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      const r = await fetch(`${apiBase()}/health`, { signal: ctrl.signal });
      clearTimeout(t);
      return r.ok;
    } catch {
      return false;
    }
  },

  // ---- 인증 ----
  async login(phone: string, password: string): Promise<AuthUserInfo> {
    const res = await post<{ token: string; user: AuthUserInfo }>('/auth/login', { phone, password });
    this.setSession(res.token, res.user);
    return res.user;
  },
  async signupParent(payload: any): Promise<AuthUserInfo> {
    const res = await post<{ token: string; user: AuthUserInfo }>('/auth/signup/parent', payload);
    this.setSession(res.token, res.user);
    return res.user;
  },
  async signupWorker(payload: any): Promise<AuthUserInfo> {
    const res = await post<{ token: string; user: AuthUserInfo }>('/auth/signup/worker', payload);
    this.setSession(res.token, res.user);
    return res.user;
  },
  loginDemo(role: 'parent' | 'worker' | 'admin') {
    const acc = MC_DEMO_ACCOUNTS[role];
    return this.login(acc.phone, acc.password);
  },

  // ---- 예약 ----
  createBooking: (payload: any) => post('/bookings', payload),
  pay: (id: string) => post(`/bookings/${id}/pay`),
  accept: (id: string) => post(`/bookings/${id}/accept`),
  reject: (id: string) => post(`/bookings/${id}/reject`),
  checkIn: (id: string) => post(`/bookings/${id}/check-in`),
  complete: (id: string) => post(`/bookings/${id}/complete`),
  listBookings: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/bookings${q ? `?${q}` : ''}`);
  },
  getWorker: (userId: string) => get(`/workers/${userId}`),
  settlement: (userId: string) => get(`/bookings/worker/${userId}/settlement`),

  // ---- 리뷰 ----
  createReview: (payload: any) => post('/reviews', payload),

  // ---- 육아일지 ----
  addCareLog: (bookingId: string, type: string, note: string) =>
    post(`/bookings/${bookingId}/care-log`, { type, note }),
  listCareLog: (bookingId: string) => get(`/bookings/${bookingId}/care-log`),

  // ---- 즐겨찾기 ----
  listFavorites: () => get('/favorites'),
  addFavorite: (workerId: string) => post(`/favorites/${workerId}`),
  removeFavorite: (workerId: string) => del(`/favorites/${workerId}`),

  // ---- 파일 ----
  uploadFile: (kind: string, dataUrl: string, mimeType: string) =>
    post('/files', { kind, dataUrl, mimeType }),
  getFile: (id: string) => get(`/files/${id}`),

  // ---- 관리자 ----
  listWorkers: (status?: string) => get(`/workers${status ? `?status=${status}` : ''}`),
  summary: () => get('/admin/summary'),
  approveWorker: (userId: string) => post(`/admin/workers/${userId}/approve`),
  rejectWorker: (userId: string, reason: string) => post(`/admin/workers/${userId}/reject`, { reason }),
};
