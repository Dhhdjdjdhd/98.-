'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { won, pad2 } from '@/lib/utils';
import { GRADES, GRADE_ORDER, GradeCode, CHILD_AGES, CHILD_AGE_OPTS, BOOKING_STATUS } from '@/lib/constants';
import { useApp } from '../context';
import { Body, Foot, NextButton, TopBar, Progress, Q, Label, Badge } from '../ui';
import { Input, Field } from '@/components/ui/input';
import { CareLogList } from '../CareLogList';
import { Villy } from '@/components/brand/Villy';

function payloadFromDraft(d: any) {
  return {
    date: `2026-07-${pad2(d.date)}`,
    startTime: d.time,
    hours: d.hours,
    address: d.address,
    childAge: d.childAge.value,
    grade: d.grade,
  };
}

/* ================= 부모 홈 ================= */
export function ParentHome() {
  const { user, live, go, logout, patch } = useApp();
  const [favs, setFavs] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [showGrades, setShowGrades] = useState(false);

  async function load() {
    if (!live || !user) return;
    try {
      const [fv, bks]: any = await Promise.all([api.listFavorites(), api.listBookings({ parentId: user.id })]);
      setFavs(fv);
      setBookings(bks);
    } catch {}
    setLoaded(true);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, user]);

  function rebook(code: GradeCode) {
    patch({ grade: code, date: undefined, time: undefined, hours: 2, address: '', childAge: undefined, bookingId: undefined, matchedWorker: undefined });
    go('date');
  }
  async function removeFav(id: string) {
    try {
      await api.removeFavorite(id);
      setFavs((f) => f.filter((x) => x.userId !== id));
    } catch (e: any) {
      alert('해제 실패: ' + e.message);
    }
  }

  // 근무중 우선, 없으면 다가오는 예약(임박순) 1건 강조
  const d = new Date();
  const today = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const asc = (a: any, b: any) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`);
  const activeOne = bookings.filter((b) => b.status === 'IN_PROGRESS').sort(asc)[0];
  const upcomingOne = bookings.filter((b) => (b.status === 'REQUESTED' || b.status === 'MATCHED') && b.date >= today).sort(asc)[0];
  const next = activeOne || upcomingOne;

  return (
    <>
      <Body>
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Villy size={40} />
            <div className="text-[13px] text-muted">
              안녕하세요, {user?.name}님
              <b className="mt-0.5 block font-serif text-xl font-bold text-ink">오늘도 안심하세요</b>
            </div>
          </div>
          <button onClick={logout} title="로그아웃" className="grid h-[34px] w-[34px] place-items-center rounded-full bg-ivory-2">🚪</button>
        </div>

        {/* 예약 배너 (브랜드 슬로건 통합) */}
        <button onClick={() => { patch({ grade: undefined }); go('grade'); }} className="mb-3 block w-full overflow-hidden rounded-[18px] bg-gradient-to-br from-terra to-terra-2 px-5 py-4 text-left text-white">
          <p className="font-serif text-[13px] leading-snug opacity-95">한 아이를 키우는 덴 온 마을이 필요합니다.<br />케어빌리지가 그 마을을 디지털로 잇습니다.</p>
          <div className="mt-3 flex items-center justify-between">
            <h4 className="text-[16px] font-extrabold">전문 육아도우미 예약</h4>
            <span className="shrink-0 rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-terra-2">시작 →</span>
          </div>
        </button>

        {/* 안심 보험 배지 */}
        <div className="mb-4"><InsuranceBadge /></div>

        {/* 빠른 메뉴 2열 */}
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          <button onClick={() => go('parent-bookings')} className="flex items-center gap-2.5 rounded-[15px] border-[1.5px] border-line bg-cream px-4 py-3.5 text-left transition hover:border-terra">
            <span className="text-xl">📋</span><span className="text-[14px] font-bold text-pine">예약내역</span>
          </button>
          <button onClick={() => setShowFavs((v) => !v)} className="flex items-center gap-2.5 rounded-[15px] border-[1.5px] border-line bg-cream px-4 py-3.5 text-left transition hover:border-terra">
            <span className="text-xl">⭐</span>
            <span className="text-[14px] font-bold text-pine">즐겨찾기{favs.length ? ` ${favs.length}` : ''}</span>
            <span className="ml-auto text-[12px] text-muted">{showFavs ? '▴' : '▾'}</span>
          </button>
        </div>

        {/* 즐겨찾기 목록 (토글) */}
        {showFavs && (
          <div className="mb-4 flex flex-col gap-2">
            {favs.length ? favs.map((fv) => (
              <div key={fv.userId} className="flex items-center gap-3 rounded-2xl border border-line bg-cream p-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl font-serif text-[15px] font-bold text-white" style={{ background: GRADES[fv.grade as GradeCode]?.badge || '#888' }}>{fv.grade || '-'}</div>
                <div className="min-w-0 flex-1"><b className="text-[13.5px]">{fv.name} {fv.licenseType}</b><span className="block truncate text-[11.5px] text-muted">{fv.careerNote} · ⭐{fv.ratingAvg ?? '-'}</span></div>
                <button onClick={() => rebook(fv.grade)} className="shrink-0 rounded-lg border border-line bg-cream px-2.5 py-1.5 text-[12.5px] font-semibold text-pine">예약</button>
                <button onClick={() => removeFav(fv.userId)} title="해제" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-cream text-[13px] text-muted">✕</button>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-line py-4 text-center text-[13px] text-muted">아직 즐겨찾기한 전문가가 없어요</div>}
          </div>
        )}

        {/* 다가오는 예약 (요약 1건) */}
        <Label>{activeOne ? '🩺 근무중' : '다가오는 예약'}</Label>
        {!live || !loaded ? (
          <div className="px-0.5 py-1.5 text-[13px] text-muted">불러오는 중…</div>
        ) : next ? (
          <>
            <button
              onClick={() => {
                if (activeOne) { patch({ bookingId: next.id, activeBack: 'parent-home' }); go('active'); }
                else go('parent-bookings');
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-line bg-cream p-4 text-left transition hover:border-terra"
            >
              <div>
                <div className="text-[15px] font-extrabold text-pine">{CHILD_AGES[next.childAge] || '아이'} 돌봄 · {next.grade}등급</div>
                <div className="mt-0.5 text-[13px] text-muted">{next.date} {next.startTime} · {next.hours}시간</div>
              </div>
              <Badge text={(BOOKING_STATUS[next.status] || [next.status, '#eee', '#888'])[0]} bg={(BOOKING_STATUS[next.status] || ['', '#eee', '#888'])[1]} color={(BOOKING_STATUS[next.status] || ['', '#eee', '#888'])[2]} />
            </button>
            {activeOne && (
              <button onClick={() => { patch({ bookingId: next.id }); go('review'); }} className="mt-2 w-full rounded-2xl bg-pine py-3 text-[14px] font-bold text-white">근무 종료 · 리뷰 남기기</button>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-line py-5 text-center text-[13px] text-muted">예정된 예약이 없어요</div>
        )}

        {/* 전문가 등급 안내 (접이식) */}
        <button onClick={() => setShowGrades((v) => !v)} className="mt-6 flex w-full items-center justify-between text-left">
          <span className="text-[13px] font-bold uppercase tracking-wide text-muted">전문가 등급 안내</span>
          <span className="text-[12px] text-muted">{showGrades ? '접기 ▴' : '펼치기 ▾'}</span>
        </button>
        {showGrades && (
          <div className="mt-2.5 flex flex-col gap-2.5">
            {GRADE_ORDER.map((g) => (
              <div key={g} className="flex items-center gap-3 rounded-2xl border border-line bg-cream p-3.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl font-serif text-lg font-bold text-white" style={{ background: GRADES[g].badge }}>{g}</div>
                <div className="flex-1"><b className="text-[14px]">{GRADES[g].name}</b><span className="block text-[12px] text-muted">시간제 전문 돌봄</span></div>
                <div className="font-serif text-[15px] font-bold text-pine">{GRADES[g].price / 10000}만원<span className="text-[11px] font-normal text-muted">/시</span></div>
              </div>
            ))}
          </div>
        )}
      </Body>
      <Foot><NextButton onClick={() => { patch({ grade: undefined }); go('grade'); }}>예약하기</NextButton></Foot>
    </>
  );
}

// 플랫폼 보험 안심 배지 (클릭 → 안전·보험 안내)
function InsuranceBadge() {
  const { go, patch, screen } = useApp();
  return (
    <button onClick={() => { patch({ safetyBack: screen }); go('safety-info'); }} className="flex w-full items-center gap-2 rounded-xl border border-[#C9E0D2] bg-[#E9F0EC] px-3.5 py-2.5 text-left transition hover:brightness-95">
      <span className="text-[15px]">🛡️</span>
      <span className="flex-1 text-[12.5px] font-semibold leading-tight text-pine">플랫폼 보험 적용 <span className="font-normal text-pine/70">— 앱으로 예약한 돌봄만 보호돼요</span></span>
      <span className="shrink-0 text-[12px] text-pine/60">안내 ›</span>
    </button>
  );
}

/* ================= 안전 · 보험 안내 ================= */
export function SafetyInfo() {
  const { draft } = useApp();
  return (
    <Body>
      <TopBar back={draft.safetyBack || 'parent-home'} title="안전 · 보험 안내" />
      <div className="mb-5 rounded-[18px] bg-gradient-to-br from-pine to-pine-2 p-6 text-white">
        <div className="text-[32px]">🛡️</div>
        <h3 className="mt-2 font-serif text-[20px] font-bold">플랫폼 보험으로 안심 돌봄</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed opacity-90">케어빌리지를 통해 예약·결제한 돌봄은 배상책임보험으로 보호됩니다.</p>
      </div>

      <Label>보장 범위</Label>
      <div className="mb-4 rounded-2xl border border-[#C9E0D2] bg-[#E9F0EC] p-4">
        <div className="mb-1.5 text-[14px] font-bold text-pine">✅ 플랫폼을 통한 돌봄</div>
        <p className="text-[13px] leading-relaxed text-ink-2">앱에서 <b>예약·결제·매칭</b>된 돌봄에 한해, 근무 중 발생한 사고에 대해 배상책임보험이 적용되고 분쟁 조정을 지원합니다.</p>
      </div>

      <Label>보장 제외 · 면책</Label>
      <div className="mb-4 rounded-2xl border border-[#E7C9C0] bg-[#FCEFE9] p-4">
        <div className="mb-1.5 text-[14px] font-bold text-terra-2">❌ 앱 밖 사적(직접) 거래</div>
        <p className="text-[13px] leading-relaxed text-ink-2">직접 연락·예약, 현금 지급 등 <b>정해진 절차를 벗어난 거래</b>는 보험·보상 대상이 아니며, 그로 인한 분쟁·사고에 대해 케어빌리지는 <b>책임지지 않습니다.</b></p>
      </div>

      <p className="px-1 text-[11.5px] leading-relaxed text-muted">※ 본 안내는 서비스 이해를 돕기 위한 요약입니다. 실제 보장 범위·한도·보상 절차는 보험 약관 및 이용약관에 따릅니다.</p>
    </Body>
  );
}

// 즐겨찾기 추가/해제 토글 버튼 (전문가 화면 공용)
function FavoriteButton({ workerId }: { workerId?: string }) {
  const [faved, setFaved] = useState(false);
  useEffect(() => {
    if (!workerId || !api.isLoggedIn()) return;
    api.listFavorites().then((fs: any) => setFaved(Array.isArray(fs) && fs.some((f: any) => f.userId === workerId))).catch(() => {});
  }, [workerId]);
  async function toggle() {
    if (!workerId) return;
    try {
      if (faved) { await api.removeFavorite(workerId); setFaved(false); }
      else { await api.addFavorite(workerId); setFaved(true); }
    } catch (e: any) { alert('즐겨찾기 처리 실패: ' + e.message); }
  }
  return (
    <button onClick={toggle} className={'w-full rounded-2xl border-[1.5px] py-3.5 text-[14px] font-bold transition ' + (faved ? 'border-terra bg-[#FCEFE9] text-terra-2' : 'border-line bg-cream text-pine hover:border-terra')}>
      {faved ? '★ 즐겨찾기 됨 (해제)' : '☆ 즐겨찾기 추가'}
    </button>
  );
}

function BookingCard({ b, onRebook, onCancel }: { b: any; onRebook: (g: GradeCode) => void; onCancel: (id: string) => void }) {
  const { go, patch, screen } = useApp();
  const st = BOOKING_STATUS[b.status] || [b.status, '#eee', '#888'];
  const amount = (GRADES[b.grade as GradeCode]?.price || 0) * b.hours;
  const [worker, setWorker] = useState<any>(null);
  useEffect(() => {
    // 배정된(취소 아닌) 예약이면 담당 근무자 정보 조회
    if (b.workerId && b.status !== 'CANCELED') {
      api.bookingWorker(b.id).then(setWorker).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b.id]);
  function openDetail() {
    // 이 예약 기준으로 담당 전문가 상세 이력 열기 (뒤로가기는 현재 화면)
    patch({ bookingId: b.id, matchedWorker: null, detailBack: screen });
    go('worker-detail');
  }
  function openActive() {
    // 근무중 예약의 근무 현황 보기 (뒤로가기는 현재 화면)
    patch({ bookingId: b.id, activeBack: screen });
    go('active');
  }
  return (
    <div className="mb-3 rounded-2xl border border-line bg-cream p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h4 className="text-[16px] font-extrabold text-pine">{CHILD_AGES[b.childAge] || '아이'} 돌봄 · {b.grade}등급</h4>
          <div className="mt-0.5 text-[13px] text-muted">{b.date} {b.startTime} · {b.hours}시간</div>
        </div>
        <Badge text={st[0]} bg={st[1]} color={st[2]} />
      </div>
      <div className="text-[13px] text-muted">📍 {b.address}</div>
      {worker && (
        <div className="mt-2 rounded-xl bg-ivory-2 px-3 py-2.5">
          <div className="text-[13px] leading-tight">
            <div><span className="text-muted">담당</span> <b className="text-pine">{worker.name} {worker.licenseType}</b> · {worker.grade}등급</div>
            <div className="mt-0.5 text-[12px] text-muted">⭐ {worker.ratingAvg} · {worker.careerNote || `경력 ${worker.careerYears}년`} · 돌봄 {worker.careCount}회</div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={openDetail} className="rounded-lg border border-line bg-white py-2 text-[13px] font-bold text-pine">📋 상세 이력</button>
            <a href={`tel:${worker.phone}`} className="flex items-center justify-center rounded-lg border border-line bg-white py-2 text-[13px] font-bold text-pine">📞 전화</a>
          </div>
        </div>
      )}
      <div className="mt-1.5 font-serif text-[16px] font-bold text-terra-2">이용 금액 {won(amount)}</div>
      {b.status === 'IN_PROGRESS' && (
        <button onClick={openActive} className="mt-2 w-full rounded-xl border-[1.5px] border-line bg-cream py-3 text-[14px] font-bold text-pine">🩺 근무 현황 보기</button>
      )}
      {b.status === 'DONE' && (
        <button onClick={() => { patch({ viewBookingId: b.id }); go('parent-carelog'); }} className="mt-2 w-full rounded-xl border-[1.5px] border-line bg-cream py-3 text-[14px] font-bold text-pine">📝 육아일지 보기</button>
      )}
      <button onClick={() => onRebook(b.grade)} className="mt-2 w-full rounded-xl border-[1.5px] border-line bg-cream py-3 text-[14px] font-bold text-pine">같은 등급으로 재예약</button>
      {(b.status === 'REQUESTED' || b.status === 'MATCHED') && (
        <button onClick={() => onCancel(b.id)} className="mt-2 w-full rounded-xl border-[1.5px] border-line bg-cream py-3 text-[14px] font-bold text-muted">예약 취소</button>
      )}
    </div>
  );
}

/* ================= 예약내역 ================= */
export function ParentBookings() {
  const { user, live, patch, go } = useApp();
  const [bookings, setBookings] = useState<any[] | null>(null);
  useEffect(() => {
    if (!user) { setBookings([]); return; }
    if (!live) return; // 서버 연결 대기 (연결되면 아래 deps로 재실행)
    api.listBookings({ parentId: user.id }).then((b: any) => setBookings(b)).catch(() => setBookings([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, user]);
  const doRebook = (code: GradeCode) => { patch({ grade: code, date: undefined, time: undefined, hours: 2, address: '', childAge: undefined, bookingId: undefined, matchedWorker: undefined }); go('date'); };
  const doCancel = async (id: string) => {
    if (!confirm('이 예약을 취소하시겠어요? 결제하신 금액은 환불 처리됩니다.')) return;
    try {
      await api.cancelBooking(id);
      setBookings((prev) => (prev ?? []).map((b) => (b.id === id ? { ...b, status: 'CANCELED' } : b)));
    } catch (e: any) { alert('취소 실패: ' + e.message); }
  };

  // 오늘(KST) — 근무일 지남 여부 판단용
  const d = new Date();
  const today = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  // 근무중 / 다가오는 / 지난 3구분
  const isActive = (b: any) => b.status === 'IN_PROGRESS';
  const isUpcoming = (b: any) => (b.status === 'REQUESTED' || b.status === 'MATCHED') && b.date >= today;
  const all = bookings ?? [];
  const asc = (a: any, b: any) => (a.date + a.startTime).localeCompare(b.date + b.startTime);
  const desc = (a: any, b: any) => (b.date + b.startTime).localeCompare(a.date + a.startTime);
  const active = all.filter(isActive).sort(asc);
  const upcoming = all.filter(isUpcoming).sort(asc);
  const past = all.filter((b) => !isActive(b) && !isUpcoming(b)).sort(desc);

  return (
    <Body>
      <TopBar back="parent-home" title="내 예약내역" />
      {bookings === null ? <div className="py-5 text-center text-[14px] text-muted">불러오는 중…</div>
        : all.length === 0 ? <div className="py-5 text-center text-[14px] text-muted">아직 예약 내역이 없어요</div>
        : (
          <>
            {active.length > 0 && (
              <>
                <Label>🩺 근무중 ({active.length})</Label>
                {active.map((b) => <BookingCard key={b.id} b={b} onRebook={doRebook} onCancel={doCancel} />)}
              </>
            )}
            <Label>다가오는 예약{upcoming.length ? ` (${upcoming.length})` : ''}</Label>
            {upcoming.length ? upcoming.map((b) => <BookingCard key={b.id} b={b} onRebook={doRebook} onCancel={doCancel} />)
              : <div className="mb-3 rounded-2xl border border-dashed border-line py-6 text-center text-[13px] text-muted">예정된 예약이 없어요</div>}
            {past.length > 0 && (
              <>
                <Label>지난 예약 ({past.length})</Label>
                <div className="opacity-60">
                  {past.map((b) => <BookingCard key={b.id} b={b} onRebook={doRebook} onCancel={doCancel} />)}
                </div>
              </>
            )}
          </>
        )}
    </Body>
  );
}

/* ================= 부모 육아일지 열람 ================= */
export function ParentCareLog() {
  const { draft } = useApp();
  return (
    <Body>
      <TopBar back="parent-bookings" title="육아일지" />
      <div className="mb-3.5 text-[13px] text-muted">담당 전문가가 기록한 돌봄 내역입니다</div>
      <CareLogList bookingId={draft.viewBookingId} />
    </Body>
  );
}

/* ================= 예약 플로우 ================= */
export function GradeSelect() {
  const { draft, patch, go } = useApp();
  return (
    <>
      <Body>
        <TopBar back="parent-home" title="전문가 등급 선택" />
        <Progress step={1} />
        <Q sub="아이 상태와 필요에 맞는 등급을 선택하세요">어떤 전문가를<br />원하시나요?</Q>
        <div className="flex flex-col gap-2.5">
          {GRADE_ORDER.map((g) => (
            <button key={g} onClick={() => patch({ grade: g })} className={'flex w-full items-center gap-3.5 rounded-[15px] border-[1.5px] bg-cream px-[18px] py-4 text-left transition ' + (draft.grade === g ? 'border-terra bg-[#FCEFE9]' : 'border-line hover:border-terra')}>
              <span className="grid h-[38px] w-[38px] place-items-center rounded-xl font-serif font-bold text-white" style={{ background: GRADES[g].badge }}>{g}</span>
              <span className="flex-1"><b className="block text-[15px]">{GRADES[g].name}</b><span className="text-[12.5px] text-muted">{GRADES[g].desc}</span></span>
              <span className="font-serif text-[14px] font-bold text-pine">{won(GRADES[g].price)}/시</span>
            </button>
          ))}
        </div>
      </Body>
      <Foot><NextButton disabled={!draft.grade} onClick={() => go('date')}>다음</NextButton></Foot>
    </>
  );
}

export function DateSelect() {
  const { draft, patch, go } = useApp();
  const dow = ['일', '월', '화', '수', '목', '금', '토'];
  const firstDow = 3; // 7/1 = 수
  return (
    <>
      <Body>
        <TopBar back="grade" title="날짜 선택" />
        <Progress step={2} />
        <Q sub="2026년 7월 · 근무 가능한 날짜만 표시됩니다">언제 도움이<br />필요하신가요?</Q>
        <div className="rounded-2xl border border-line bg-cream p-4">
          <div className="mb-3.5 flex items-center justify-between text-[15px] font-bold text-pine"><span>‹</span><span>2026년 7월</span><span>›</span></div>
          <div className="grid grid-cols-7 gap-1">
            {dow.map((d) => <div key={d} className="py-1.5 text-center text-[11px] font-semibold text-muted">{d}</div>)}
            {Array.from({ length: firstDow }).map((_, i) => <div key={'e' + i} />)}
            {Array.from({ length: 31 }).map((_, i) => {
              const d = i + 1;
              const past = d < 7;
              const sel = draft.date === d;
              return (
                <div key={d} onClick={() => !past && patch({ date: d })}
                  className={'grid aspect-square place-items-center rounded-[10px] text-[13.5px] ' + (past ? 'text-[#CFC6B6]' : sel ? 'bg-terra font-bold text-white' : 'cursor-pointer text-ink hover:bg-ivory-2')}>
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      </Body>
      <Foot><NextButton disabled={!draft.date} onClick={() => go('time')}>다음</NextButton></Foot>
    </>
  );
}

export function TimeSelect() {
  const { draft, patch, go } = useApp();
  const durations = [1, 2, 3, 4, 6];
  const [custom, setCustom] = useState(false);
  useEffect(() => {
    if (draft.hours && !durations.includes(draft.hours)) setCustom(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const chip = (active: boolean) => 'rounded-xl border-[1.5px] py-3 text-center text-[14px] font-semibold transition ' + (active ? 'border-terra bg-terra text-white' : 'border-line bg-cream text-ink hover:border-terra');
  const sel = 'w-full rounded-xl border-[1.5px] border-line bg-cream px-4 py-3 text-[14px] font-semibold text-ink outline-none focus:border-terra';
  const [curH, curM] = (draft.time || '').split(':');
  const setTime = (hh: string, mm: string) => patch({ time: `${hh}:${mm}` });
  return (
    <>
      <Body>
        <TopBar back="date" title="시간 선택" />
        <Progress step={3} />
        <Q sub={`7월 ${draft.date}일 · 시작 시간을 선택하세요`}>몇 시부터<br />몇 시간 필요하세요?</Q>
        <Label>시작 시간</Label>
        <div className="grid grid-cols-2 gap-2">
          <select className={sel} value={curH ?? ''} onChange={(e) => setTime(e.target.value, curM || '00')}>
            <option value="" disabled>시 선택</option>
            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((hh) => <option key={hh} value={hh}>{hh}시</option>)}
          </select>
          <select className={sel} value={curM ?? ''} onChange={(e) => setTime(curH || '09', e.target.value)}>
            <option value="" disabled>분 선택</option>
            {['00', '15', '30', '45'].map((mm) => <option key={mm} value={mm}>{mm}분</option>)}
          </select>
        </div>
        <Label>이용 시간</Label>
        <div className="grid grid-cols-3 gap-2">
          {durations.map((d) => <button key={d} className={chip(!custom && draft.hours === d)} onClick={() => { setCustom(false); patch({ hours: d }); }}>{d}시간</button>)}
          <button className={chip(custom)} onClick={() => setCustom(true)}>기타</button>
        </div>
        {custom && (
          <input type="number" min={1} max={24} value={draft.hours ?? ''} onChange={(e) => patch({ hours: Number(e.target.value) })} placeholder="시간 직접 입력 (예: 8)" className={sel + ' mt-2'} />
        )}
      </Body>
      <Foot><NextButton disabled={!draft.time || !draft.hours} onClick={() => go('address')}>다음</NextButton></Foot>
    </>
  );
}

export function AddressChild() {
  const { draft, patch, go, user } = useApp();
  useEffect(() => {
    // 주소·아이나이 미입력 시 최근 예약값을 기본으로 채움
    if (!api.isLoggedIn() || !user) return;
    if (draft.address && draft.childAge) return;
    api.listBookings({ parentId: user.id }).then((list: any) => {
      if (Array.isArray(list) && list.length) {
        // 예약 이력 있으면 근무 예정일(date) 최신 예약의 주소·아이나이 (동일 날짜는 시작시간 비교)
        const recent = [...list].sort((a, b) => String(`${b.date} ${b.startTime}`).localeCompare(`${a.date} ${a.startTime}`))[0];
        const opt = CHILD_AGE_OPTS.find(([, , , v]) => v === recent.childAge);
        patch({
          address: draft.address || recent.address || '',
          childAge: draft.childAge || (opt ? { value: opt[3], label: opt[1] } : undefined),
        });
      } else {
        // 예약 이력 없으면 가입 시 주소를 기본값으로
        api.getParent(user.id).then((p: any) => {
          if (p?.profile?.address) patch({ address: draft.address || p.profile.address });
        }).catch(() => {});
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Body>
        <TopBar back="time" title="주소 · 아이 정보" />
        <Progress step={4} />
        <Q sub="방문 주소와 아이 나이를 알려주세요">어디로,<br />누구를 돌볼까요?</Q>
        <Field label="돌봄 장소"><Input value={draft.address} onChange={(e) => patch({ address: e.target.value })} placeholder="예) 서울시 강남구 테헤란로 123" /></Field>
        <Label>아이 나이</Label>
        <div className="flex flex-col gap-2.5">
          {CHILD_AGE_OPTS.map(([ic, l, s, v]) => (
            <button key={v} onClick={() => patch({ childAge: { value: v, label: l } })} className={'flex w-full items-center gap-3.5 rounded-[15px] border-[1.5px] bg-cream px-[18px] py-4 text-left transition ' + (draft.childAge?.value === v ? 'border-terra bg-[#FCEFE9]' : 'border-line hover:border-terra')}>
              <span className="text-2xl">{ic}</span>
              <span className="flex-1"><b className="block text-[15px]">{l}</b><span className="text-[12.5px] text-muted">{s}</span></span>
            </button>
          ))}
        </div>
      </Body>
      <Foot><NextButton disabled={!(draft.address && draft.childAge)} onClick={() => go('pay')}>다음</NextButton></Foot>
    </>
  );
}

export function Pay() {
  const { draft, go } = useApp();
  const [agreed, setAgreed] = useState(false);
  const g = GRADES[draft.grade as GradeCode];
  const base = g.price * draft.hours;
  const fee = Math.round(base * 0.15);
  const Row = ({ l, v }: { l: string; v: string }) => (
    <div className="flex justify-between border-b border-dashed border-line py-2.5 text-[14px] text-ink-2 last:border-0"><span>{l}</span><b className="font-semibold text-ink">{v}</b></div>
  );
  return (
    <>
      <Body>
        <TopBar back="address" title="결제" />
        <Progress step={5} />
        <Q sub="결제 후 전문가가 자동 매칭됩니다">예약 내용을<br />확인해 주세요</Q>
        <div className="mb-4 rounded-[18px] border border-line bg-cream p-[22px]">
          <Row l="전문가 등급" v={`${g.code}등급 · ${g.name}`} />
          <Row l="일정" v={`7월 ${draft.date}일 ${draft.time}~ · ${draft.hours}시간`} />
          <Row l="아이" v={draft.childAge!.label} />
          <Row l="장소" v={draft.address} />
        </div>
        <div className="rounded-[18px] border border-line bg-cream p-[22px]">
          <div className="flex justify-between py-2.5 text-[14px] text-ink-2"><span>시급 {won(g.price)} × {draft.hours}시간</span><b className="text-ink">{won(base)}</b></div>
          <div className="mt-3.5 flex items-baseline justify-between border-t-2 border-ink pt-3.5"><span className="text-[14px] font-bold">총 결제금액</span><b className="font-serif text-[26px] text-terra-2">{won(base)}</b></div>
        </div>
        <div className="mx-0.5 mb-4 mt-1.5 text-[11.5px] text-muted">※ 플랫폼 수수료 15%({won(fee)})는 근무자 정산에서 차감됩니다.</div>
        <Label>결제 수단</Label>
        <div className="flex items-center gap-3.5 rounded-[15px] border-[1.5px] border-terra bg-[#FCEFE9] px-[18px] py-4">
          <span className="text-2xl">💳</span><span className="flex-1"><b className="block text-[15px]">신한카드 ****1234</b><span className="text-[12.5px] text-muted">등록된 기본 카드</span></span>
        </div>
        {/* 안심 보험 + 필수 동의 */}
        <div className="mt-3"><InsuranceBadge /></div>
        <label className="mt-2.5 flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-cream px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-2">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-terra" />
          <span><b className="text-ink">[필수]</b> 보험·보상은 케어빌리지를 통한 예약에만 적용되며, 앱 외부 사적 거래로 발생한 문제에 플랫폼이 책임지지 않음을 확인했습니다.</span>
        </label>
      </Body>
      <Foot><NextButton disabled={!agreed} onClick={() => go('matching')}>{won(base)} 결제하고 매칭</NextButton></Foot>
    </>
  );
}

export function Matching() {
  const { draft, patch, go } = useApp();
  const started = useRef(false);
  const alive = useRef(true);
  const [failed, setFailed] = useState(false);

  const runMatch = async () => {
    setFailed(false);
    if (!api.isLoggedIn()) {
      setTimeout(() => alive.current && go('matched'), 2000);
      return;
    }
    try {
      const created: any = await api.createBooking(payloadFromDraft(draft));
      const bid = created.booking.id;
      const paid: any = await api.pay(bid);
      if (!alive.current) return;
      if (paid.matched) {
        const worker: any = await api.getWorker(paid.workerId);
        if (alive.current) { patch({ bookingId: bid, matchedWorker: worker }); go('matched'); }
      } else {
        // 조건에 맞는 전문가가 없으면 예약을 롤백(취소)하고 그 자리에서 재조정 유도
        try { await api.cancelBooking(bid); } catch {}
        if (alive.current) setFailed(true);
      }
    } catch (e) {
      console.warn('매칭 처리 오류', e);
    }
  };

  useEffect(() => {
    alive.current = true; // StrictMode 재마운트 시 재활성화
    if (started.current) return; // 예약 중복 생성 방지 (최초 1회만 실행)
    started.current = true;
    runMatch();
    return () => { alive.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <Body className="pt-12 text-center">
        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-ivory-2 text-[36px]">🔍</div>
        <h3 className="font-serif text-[21px] font-bold text-pine">조건에 맞는 전문가가<br />지금은 없어요</h3>
        <p className="mt-2 text-[13.5px] text-ink-2">등급을 바꿔 바로 다시 찾거나,<br />시간을 조정해 보세요. (결제는 취소되었습니다)</p>
        <div className="mt-6 text-left">
          <Label>등급 변경</Label>
          <div className="grid grid-cols-4 gap-2">
            {GRADE_ORDER.map((g) => (
              <button key={g} onClick={() => patch({ grade: g })} className={'rounded-xl border-[1.5px] py-2.5 text-[13px] font-bold transition ' + (draft.grade === g ? 'border-terra bg-terra text-white' : 'border-line bg-cream text-ink hover:border-terra')}>{g}등급</button>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2.5">
          <button onClick={runMatch} className="w-full rounded-2xl bg-terra py-3.5 text-[14px] font-bold text-white">이 조건으로 다시 찾기</button>
          <button onClick={() => go('time')} className="w-full rounded-2xl border-[1.5px] border-line bg-cream py-3.5 text-[14px] font-bold text-pine">시간 변경</button>
          <button onClick={() => go('parent-home')} className="w-full rounded-2xl border-[1.5px] border-line bg-cream py-3.5 text-[14px] font-bold text-muted">홈으로</button>
        </div>
      </Body>
    );
  }

  return (
    <Body className="pt-20 text-center">
      <div className="mx-auto mb-6 h-24 w-24 animate-spin rounded-full border-4 border-line border-t-terra" />
      <h3 className="font-serif text-[24px] font-bold text-pine">전문가를 찾고 있어요</h3>
      <p className="mt-2 text-[14px] text-ink-2">{draft.time} 시작 · {draft.hours}시간<br />{draft.grade}등급 전문가를 매칭 중입니다…</p>
    </Body>
  );
}

export function Matched() {
  const { draft, go, patch, resetDraft } = useApp();
  const [busy, setBusy] = useState(false);
  const w = draft.matchedWorker;
  const doRematch = async () => {
    if (!draft.bookingId) return alert('데모 모드에서는 변경할 수 없습니다.');
    if (!confirm('현재 전문가 대신 다른 전문가로 변경할까요?')) return;
    setBusy(true);
    try {
      const res: any = await api.rematch(draft.bookingId);
      if (res.matched) {
        const worker: any = await api.getWorker(res.workerId);
        patch({ matchedWorker: worker });
        alert('다른 전문가로 변경되었습니다.');
      } else {
        // 대체 후보 없음 → 현재 전문가 그대로 유지, 화면 이동하지 않음
        alert('지금은 배정 가능한 다른 전문가가 없어요.\n현재 전문가를 그대로 유지합니다. 원하시면 아래 "예약 취소"를 이용하세요.');
      }
    } catch (e: any) { alert('변경 실패: ' + e.message); }
    finally { setBusy(false); }
  };
  const doCancel = async () => {
    if (!draft.bookingId) return alert('데모 모드에서는 취소할 수 없습니다.');
    if (!confirm('이 예약을 취소하시겠어요? 결제하신 금액은 환불 처리됩니다.')) return;
    setBusy(true);
    try {
      await api.cancelBooking(draft.bookingId);
      alert('예약이 취소되었습니다.');
      resetDraft();
      go('parent-home');
    } catch (e: any) { alert('취소 실패: ' + e.message); }
    finally { setBusy(false); }
  };
  const name = w ? w.name : '김서연';
  const role = w ? w.profile.licenseType : '간호사';
  const career = w ? w.profile.careerNote || `${w.profile.careerYears}년 경력` : '신생아실 7년 경력';
  const rating = w ? w.profile.ratingAvg : 4.9;
  const care = w ? w.profile.careCount : 328;
  const years = w ? w.profile.careerYears : 7;
  return (
    <>
      <Body>
        <div className="my-2.5 text-center"><span className="rounded-full bg-[#E9F0EC] px-3.5 py-1.5 text-[13px] font-bold text-pine">✓ 매칭 완료{api.isLoggedIn() ? ' · 실서버' : ''}</span></div>
        <div className="mb-4 rounded-[20px] border border-line bg-cream p-6 text-center">
          <div className="mx-auto mb-3.5 grid h-[88px] w-[88px] place-items-center rounded-full bg-gradient-to-br from-amber to-terra text-[40px]">👩‍⚕️</div>
          <h4 className="text-xl font-extrabold text-pine">{name} {role}</h4>
          <div className="my-1.5 text-[13px] text-muted">{draft.grade}등급 · {career}</div>
          <div className="mb-4 flex flex-wrap justify-center gap-1.5">
            {['면허 인증', '범죄경력 조회', '아동학대 조회', '보건증'].map((t) => <span key={t} className="rounded-full bg-[#E9F0EC] px-2.5 py-1 text-[11.5px] font-semibold text-pine">✓ {t}</span>)}
          </div>
          <div className="flex justify-center gap-7 border-t border-line pt-4">
            <div><b className="block font-serif text-xl text-pine">{rating}</b><span className="text-[11.5px] text-muted">평점</span></div>
            <div><b className="block font-serif text-xl text-pine">{care}</b><span className="text-[11.5px] text-muted">돌봄 횟수</span></div>
            <div><b className="block font-serif text-xl text-pine">{years}년</b><span className="text-[11.5px] text-muted">경력</span></div>
          </div>
        </div>
        <div className="mb-3">
          <InsuranceBadge />
          <p className="mt-1.5 px-1 text-[11.5px] text-muted">⚠️ 이후 앱 밖에서 직접 연락·거래하면 보험·보상을 받을 수 없어요.</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={() => { patch({ detailBack: 'matched' }); go('worker-detail'); }} className="rounded-2xl border-[1.5px] border-line bg-cream py-3.5 text-[14px] font-bold text-pine">📋 상세 이력</button>
          {w?.phone
            ? <a href={`tel:${w.phone}`} className="flex items-center justify-center rounded-2xl border-[1.5px] border-line bg-cream py-3.5 text-[14px] font-bold text-pine">📞 전화</a>
            : <button onClick={() => alert('데모 모드에서는 전화 연결이 지원되지 않습니다.')} className="rounded-2xl border-[1.5px] border-line bg-cream py-3.5 text-[14px] font-bold text-pine">📞 전화</button>}
        </div>
        {draft.matchedWorker?.id && <div className="mt-2.5"><FavoriteButton workerId={draft.matchedWorker.id} /></div>}
        <button onClick={doRematch} disabled={busy} className="mt-2.5 w-full rounded-2xl border-[1.5px] border-line bg-cream py-3.5 text-[14px] font-bold text-muted disabled:opacity-50">🔄 다른 전문가로 변경</button>
        <button onClick={doCancel} disabled={busy} className="mt-2.5 w-full rounded-2xl border-[1.5px] border-line bg-cream py-3.5 text-[14px] font-bold text-muted disabled:opacity-50">예약 취소</button>
        <button onClick={() => { resetDraft(); go('parent-home'); }} className="mt-2.5 w-full rounded-2xl bg-pine py-3.5 text-[14px] font-bold text-white">🏠 홈으로</button>
      </Body>
    </>
  );
}

/* ================= 담당 전문가 상세 이력 ================= */
export function WorkerDetail() {
  const { draft, go, resetDraft } = useApp();
  const [info, setInfo] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const goHome = () => { resetDraft(); go('parent-home'); };
  useEffect(() => {
    const loadReviews = (id?: string) => { if (id) api.listReviews(id).then((r: any) => setReviews(Array.isArray(r) ? r : [])).catch(() => {}); };
    const w = draft.matchedWorker;
    if (w?.id) {
      const p = w.profile || {};
      setInfo({ workerId: w.id, name: w.name, licenseType: p.licenseType, grade: p.grade, ratingAvg: p.ratingAvg, careCount: p.careCount, careerYears: p.careerYears, careerNote: p.careerNote, docs: p.docs || {} });
      loadReviews(w.id);
    } else if (draft.bookingId) {
      // 매칭 임시정보가 없으면 예약ID로 담당자 재조회(견고성)
      api.bookingWorker(draft.bookingId).then((d: any) => {
        if (!d) return;
        setInfo({ workerId: d.workerId, name: d.name, licenseType: d.licenseType, grade: d.grade, ratingAvg: d.ratingAvg, careCount: d.careCount, careerYears: d.careerYears, careerNote: d.careerNote, docs: d.docs || {} });
        loadReviews(d.workerId);
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!info) {
    return (
      <Body>
        <TopBar back={draft.detailBack || 'matched'} title="상세 이력" />
        <div className="py-12 text-center text-[14px] text-muted">
          전문가 정보를 불러올 수 없습니다.
          <button onClick={goHome} className="mx-auto mt-4 block rounded-xl bg-pine px-5 py-2.5 text-[13px] font-bold text-white">🏠 홈으로</button>
        </div>
      </Body>
    );
  }
  const docs: any = info.docs || {};
  const docLabels: [string, string][] = [['license', '면허'], ['criminalCheck', '범죄경력'], ['childAbuseCheck', '아동학대'], ['healthCert', '보건증']];
  return (
    <Body>
      <TopBar back={draft.detailBack || 'matched'} title="상세 이력" />
      {/* ① 프로필 + ② 핵심 지표 */}
      <div className="mb-4 rounded-[20px] border border-line bg-cream p-6 text-center">
        <div className="mx-auto mb-3 grid h-[80px] w-[80px] place-items-center rounded-full bg-gradient-to-br from-amber to-terra text-[36px]">👩‍⚕️</div>
        <h4 className="text-xl font-extrabold text-pine">{info.name} {info.licenseType}</h4>
        <div className="mt-1 text-[13px] text-muted">{info.grade}등급 · {info.careerNote || `경력 ${info.careerYears}년`}</div>
        <div className="mt-4 flex justify-center gap-7 border-t border-line pt-4">
          <div><b className="block font-serif text-xl text-pine">{info.ratingAvg ?? '-'}</b><span className="text-[11.5px] text-muted">평점</span></div>
          <div><b className="block font-serif text-xl text-pine">{info.careCount ?? 0}</b><span className="text-[11.5px] text-muted">돌봄 횟수</span></div>
          <div><b className="block font-serif text-xl text-pine">{info.careerYears ?? 0}년</b><span className="text-[11.5px] text-muted">경력</span></div>
        </div>
      </div>
      {/* 즐겨찾기 */}
      {info.workerId && <div className="mb-4"><FavoriteButton workerId={info.workerId} /></div>}
      {/* ③ 검증 뱃지 */}
      <Label>인증 현황</Label>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {docLabels.map(([k, l]) => (
          <span key={k} className={'rounded-full px-3 py-1.5 text-[12px] font-semibold ' + (docs[k] ? 'bg-[#E9F0EC] text-pine' : 'bg-ivory-2 text-muted')}>{docs[k] ? '✓' : '·'} {l}</span>
        ))}
      </div>
      {/* ⑤ 받은 리뷰 */}
      <Label>받은 리뷰{reviews.length ? ` (${reviews.length})` : ''}</Label>
      {reviews.length ? reviews.map((r) => (
        <div key={r.id} className="mb-2.5 rounded-2xl border border-line bg-cream p-4">
          <div className="mb-1.5 text-[13px] text-amber">{'⭐'.repeat(r.rating)}</div>
          {r.tags?.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {r.tags.map((t: string) => <span key={t} className="rounded-full bg-ivory-2 px-2.5 py-1 text-[11.5px] font-semibold text-ink-2">{t}</span>)}
            </div>
          )}
          {r.comment && <p className="text-[13.5px] text-ink-2">{r.comment}</p>}
        </div>
      )) : <div className="py-6 text-center text-[13px] text-muted">아직 받은 리뷰가 없어요</div>}
      <button onClick={goHome} className="mt-5 w-full rounded-2xl bg-pine py-3.5 text-[14px] font-bold text-white">🏠 홈으로</button>
    </Body>
  );
}

export function Active() {
  const { draft, go } = useApp();
  useEffect(() => {
    // 매칭완료에서 바로 진입한 경우에만 근무 시작(check-in) 처리 (예약내역서 재진입은 제외)
    if (!draft.activeBack && api.isLoggedIn() && draft.bookingId) api.checkIn(draft.bookingId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Body>
        <TopBar back={draft.activeBack || 'matched'} title="근무 현황" />
        {/* 근무 진행 상태 */}
        <div className="mb-4 rounded-[18px] border border-line bg-cream p-5 text-center">
          <div className="text-[32px]">🩺</div>
          <div className="mt-1.5 font-serif text-[18px] font-bold text-pine">근무가 진행 중이에요</div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">담당 전문가가 아이를 돌보고 있어요.<br />아래에서 실시간 기록을 확인하세요.</p>
        </div>
        <Label>실시간 육아일지</Label>
        <CareLogList bookingId={draft.bookingId} />
      </Body>
      <Foot><NextButton onClick={() => go('review')}>근무 종료 · 리뷰 남기기</NextButton></Foot>
    </>
  );
}

export function Review() {
  const { draft, patch, go } = useApp();
  const tags = ['친절해요', '전문성 최고', '시간 준수', '꼼꼼한 케어', '아이가 좋아함', '또 만나고 싶어요'];
  const toggle = (t: string) => patch({ reviewTags: draft.reviewTags.includes(t) ? draft.reviewTags.filter((x) => x !== t) : [...draft.reviewTags, t] });
  async function submit() {
    if (api.isLoggedIn() && draft.bookingId) {
      try {
        await api.complete(draft.bookingId);
        await api.createReview({ bookingId: draft.bookingId, authorRole: 'PARENT', rating: draft.rating || 5, tags: draft.reviewTags, comment: '' });
      } catch (e) { console.warn('리뷰 실패', e); }
    }
    go('done');
  }
  const w = draft.matchedWorker;
  return (
    <>
      <Body>
        <TopBar back="active" title="리뷰 작성" />
        <div className="mb-4 rounded-[20px] border border-line bg-cream p-5 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-amber to-terra text-[30px]">👩‍⚕️</div>
          <h4 className="mt-2 text-[17px] font-extrabold text-pine">{w ? w.name : '김서연'} 전문가와의<br />돌봄은 어떠셨나요?</h4>
        </div>
        <div className="my-5 flex justify-center gap-2 text-[38px]">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => patch({ rating: n })} className={'transition ' + (n <= draft.rating ? 'text-amber' : 'text-line')}>★</button>
          ))}
        </div>
        <div className="mb-2 text-center text-[12px] font-bold uppercase tracking-wide text-muted">좋았던 점을 골라주세요</div>
        <div className="flex flex-wrap justify-center gap-2">
          {tags.map((t) => (
            <button key={t} onClick={() => toggle(t)} className={'rounded-full border-[1.5px] px-3.5 py-2.5 text-[13px] font-semibold transition ' + (draft.reviewTags.includes(t) ? 'border-pine bg-pine text-white' : 'border-line bg-cream text-ink-2')}>{t}</button>
          ))}
        </div>
      </Body>
      <Foot><NextButton onClick={submit}>리뷰 등록하기</NextButton></Foot>
    </>
  );
}

export function Done() {
  const { draft, go, resetDraft } = useApp();
  async function addFav() {
    if (!api.isLoggedIn() || !draft.matchedWorker?.id) return alert('즐겨찾기에 추가되었습니다 ⭐ (데모)');
    try { await api.addFavorite(draft.matchedWorker.id); alert('즐겨찾기에 추가되었습니다 ⭐'); }
    catch (e: any) { alert('추가 실패: ' + e.message); }
  }
  return (
    <>
      <Body className="pt-10 text-center">
        <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-pine text-[48px] text-white">✓</div>
        <h3 className="font-serif text-[24px] font-bold text-pine">돌봄이 완료되었어요!</h3>
        <p className="mb-6 mt-2.5 text-[14px] text-ink-2">소중한 리뷰가 등록되었습니다.<br />전문가를 즐겨찾기에 추가할까요?</p>
        <button onClick={addFav} className="rounded-full border-[1.5px] border-line bg-cream px-[22px] py-3 text-[14px] font-semibold text-pine">⭐ 즐겨찾기 추가</button>
      </Body>
      <Foot><NextButton onClick={() => { resetDraft(); go('parent-home'); }}>처음으로 돌아가기</NextButton></Foot>
    </>
  );
}
