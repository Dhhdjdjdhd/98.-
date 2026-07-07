/* ============================================================
   맘케어 프로토타입 — 백엔드 API 클라이언트
   서버가 켜져 있으면 실데이터 연동, 꺼져 있으면 app.js가 데모모드로 폴백
   ============================================================ */

// 로컬(localhost/file://)에서는 로컬 백엔드, 배포 환경에서는 Azure 백엔드 URL 사용
const MC_API_LOCAL = 'http://localhost:3000/api';
// ↓↓↓ App Service 배포 후, 실제 백엔드 URL로 교체하세요 (예: https://momcare-api.azurewebsites.net/api)
const MC_API_PROD = 'https://REPLACE-WITH-YOUR-BACKEND.azurewebsites.net/api';
const MC_IS_LOCAL =
  ['localhost', '127.0.0.1', ''].includes(location.hostname) ||
  location.protocol === 'file:';
const MC_API_BASE = MC_IS_LOCAL ? MC_API_LOCAL : MC_API_PROD;
const MC_PARENT_ID = 'usr_parent01'; // 시드된 데모 부모(지민맘)

const pad2 = (n) => String(n).padStart(2, '0');

const mcApi = {
  live: false, // 서버 연결 여부 (check()로 갱신)

  // 서버 생존 확인 (1.5초 타임아웃)
  async check() {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      const r = await fetch(`${MC_API_BASE}/admin/summary`, { signal: ctrl.signal });
      clearTimeout(t);
      this.live = r.ok;
    } catch {
      this.live = false;
    }
    return this.live;
  },

  async _post(path, body) {
    const r = await fetch(`${MC_API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) throw new Error(`POST ${path} → ${r.status}`);
    return r.json();
  },

  async _get(path) {
    const r = await fetch(`${MC_API_BASE}${path}`);
    if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
    return r.json();
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

  // 현재 예약 상태(mcState)를 API 페이로드로 변환
  buildBookingPayload(s) {
    return {
      parentId: MC_PARENT_ID,
      date: `2026-07-${pad2(s.date)}`,
      startTime: s.time,
      hours: s.hours,
      address: s.address,
      childAge: s.childAge.value, // NEWBORN | INFANT | TODDLER
      grade: s.grade.code, // A | B | C | D
    };
  },
};
