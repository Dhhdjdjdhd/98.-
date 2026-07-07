/* ============================================================
   맘케어 프로토타입 — 백엔드 API 클라이언트 (인증 포함)
   서버가 켜져 있으면 실데이터 연동, 꺼져 있으면 app.js가 데모모드로 폴백
   ============================================================ */

const MC_API_LOCAL = 'http://localhost:3000/api';
// Render 배포 백엔드 URL
const MC_API_PROD = 'https://momcare-api-9qr2.onrender.com/api';
const MC_IS_LOCAL =
  ['localhost', '127.0.0.1', ''].includes(location.hostname) ||
  location.protocol === 'file:';
const MC_API_BASE = MC_IS_LOCAL ? MC_API_LOCAL : MC_API_PROD;

// 데모용 시드 계정 (공통 비번 test1234)
const MC_DEMO_ACCOUNTS = {
  parent: { phone: '010-1111-1111', password: 'test1234' },
  worker: { phone: '010-2222-0001', password: 'test1234' },
  admin: { phone: '010-0000-0000', password: 'test1234' },
};

const pad2 = (n) => String(n).padStart(2, '0');

const mcApi = {
  live: false, // 서버 연결 여부 (check()로 갱신)
  token: localStorage.getItem('mc_token') || null,
  user: JSON.parse(localStorage.getItem('mc_user') || 'null'),

  // 서버 생존 확인 (공개 health, 1.5초 타임아웃)
  async check() {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      const r = await fetch(`${MC_API_BASE}/health`, { signal: ctrl.signal });
      clearTimeout(t);
      this.live = r.ok;
    } catch {
      this.live = false;
    }
    return this.live;
  },

  // ---- 세션 관리 ----
  isLoggedIn() {
    return !!this.token;
  },
  setSession(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('mc_token', token);
    localStorage.setItem('mc_user', JSON.stringify(user));
  },
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('mc_token');
    localStorage.removeItem('mc_user');
  },
  _authHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  },

  async _post(path, body) {
    const r = await fetch(`${MC_API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this._authHeaders() },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) {
      const msg = await r.json().catch(() => ({}));
      throw new Error(msg.message || `POST ${path} → ${r.status}`);
    }
    return r.json();
  },

  async _get(path) {
    const r = await fetch(`${MC_API_BASE}${path}`, { headers: this._authHeaders() });
    if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
    return r.json();
  },

  // ---- 인증 ----
  async login(phone, password) {
    const res = await this._post('/auth/login', { phone, password });
    this.setSession(res.token, res.user);
    return res.user;
  },
  async signupParent(payload) {
    const res = await this._post('/auth/signup/parent', payload);
    this.setSession(res.token, res.user);
    return res.user;
  },
  async signupWorker(payload) {
    const res = await this._post('/auth/signup/worker', payload);
    this.setSession(res.token, res.user);
    return res.user;
  },
  // 역할별 데모 계정으로 로그인
  loginDemo(role) {
    const acc = MC_DEMO_ACCOUNTS[role];
    return this.login(acc.phone, acc.password);
  },

  // ---- 예약 플로우 ----
  createBooking(payload) {
    return this._post('/bookings', payload);
  },
  pay(bookingId) {
    return this._post(`/bookings/${bookingId}/pay`);
  },
  checkIn(bookingId) {
    return this._post(`/bookings/${bookingId}/check-in`);
  },
  complete(bookingId) {
    return this._post(`/bookings/${bookingId}/complete`);
  },
  createReview(payload) {
    return this._post('/reviews', payload);
  },

  // ---- 서류 파일 ----
  uploadFile(kind, dataUrl, mimeType) {
    return this._post('/files', { kind, dataUrl, mimeType });
  },
  getFile(id) {
    return this._get(`/files/${id}`);
  },

  // ---- 조회 ----
  getWorker(userId) {
    return this._get(`/workers/${userId}`);
  },
  settlement(workerUserId) {
    return this._get(`/bookings/worker/${workerUserId}/settlement`);
  },
  listWorkers(status) {
    return this._get(`/workers${status ? `?status=${status}` : ''}`);
  },
  listBookings(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this._get(`/bookings${q ? `?${q}` : ''}`);
  },
  summary() {
    return this._get('/admin/summary');
  },

  // ---- 관리자 ----
  approveWorker(userId) {
    return this._post(`/admin/workers/${userId}/approve`);
  },
  rejectWorker(userId, reason) {
    return this._post(`/admin/workers/${userId}/reject`, { reason });
  },

  // 현재 예약 상태(mcState)를 API 페이로드로 변환 (parentId는 서버가 토큰에서 처리)
  buildBookingPayload(s) {
    return {
      date: `2026-07-${pad2(s.date)}`,
      startTime: s.time,
      hours: s.hours,
      address: s.address,
      childAge: s.childAge.value, // NEWBORN | INFANT | TODDLER
      grade: s.grade.code, // A | B | C | D
    };
  },
};
