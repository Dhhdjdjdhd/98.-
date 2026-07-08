'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { won } from '@/lib/utils';
import { GRADES, GradeCode, CHILD_AGES, CARE_TYPES } from '@/lib/constants';
import { useApp } from '../context';
import { Body, Foot, NextButton, TopBar, Label, Badge } from '../ui';
import { Input } from '@/components/ui/input';
import { CareLogList } from '../CareLogList';

/* ================= 근무자 홈 ================= */
export function WorkerHome() {
  const { user, live, logout, go, patch } = useApp();
  const [data, setData] = useState<{ earn: number; count: number; rating: any; grade: any; bookings: any[] } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!live || !user) { setData(null); return; }
      try {
        const [settle, detail, bookings]: any = await Promise.all([
          api.settlement(user.id), api.getWorker(user.id), api.listBookings({ workerId: user.id }),
        ]);
        if (alive) setData({
          earn: settle.totalPayout, count: settle.completedCount,
          rating: detail.profile?.ratingAvg ?? '-', grade: detail.profile?.grade ?? '',
          bookings: bookings.filter((b: any) => b.status !== 'CANCELED').reverse(),
        });
      } catch {}
    })();
    return () => { alive = false; };
  }, [live, user, tick]);

  async function checkIn(id: string) {
    try { await api.checkIn(id); setTick((t) => t + 1); } catch (e: any) { alert('근무 시작 실패: ' + e.message); }
  }
  async function complete(id: string) {
    try { await api.complete(id); setTick((t) => t + 1); } catch (e: any) { alert('근무 완료 실패: ' + e.message); }
  }

  return (
    <Body>
      <div className="mb-5 flex items-center justify-between">
        <div className="text-[13px] text-muted">{user?.name}님 👩‍⚕️<b className="mt-0.5 block font-serif text-xl font-bold text-ink">오늘도 안전 근무!</b></div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#E9F0EC] px-2.5 py-1 text-[11.5px] font-semibold text-pine">{data?.grade}등급 · 활동중</span>
          <button onClick={logout} title="로그아웃" className="grid h-[34px] w-[34px] place-items-center rounded-full bg-ivory-2">🚪</button>
        </div>
      </div>

      <div className="mb-4 rounded-[20px] bg-gradient-to-br from-pine-soft to-pine p-6 text-white">
        <div className="text-[13px] opacity-80">누적 정산 수입</div>
        <div className="my-1 font-serif text-[32px] font-bold">{data ? won(data.earn) : '—'}</div>
        <div className="flex justify-between border-t border-white/15 pt-3 text-[13px] opacity-85"><span>완료 근무 {data ? data.count : '—'}건</span><span>평점 ⭐ {data ? data.rating : '—'}</span></div>
      </div>

      <Label>내 배정 근무</Label>
      {!live || !user ? <div className="py-5 text-center text-[14px] text-muted">데모 모드 — 로그인 시 실데이터</div>
        : !data ? <div className="py-5 text-center text-[14px] text-muted">불러오는 중…</div>
        : data.bookings.length ? data.bookings.map((b) => {
            const st = b.status;
            const payout = Math.round((GRADES[b.grade as GradeCode]?.price || 0) * b.hours * 0.85);
            const label = st === 'MATCHED' ? ['배정됨', '#FCEFE9', '#C0532F'] : st === 'IN_PROGRESS' ? ['근무중', '#E9F0EC', '#16443C'] : ['완료', '#EEF2F6', '#5A6B7B'];
            return (
              <div key={b.id} className="mb-3 rounded-2xl border border-line bg-cream p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div><h4 className="text-[16px] font-extrabold text-pine">{CHILD_AGES[b.childAge] || '아이'} 돌봄</h4><div className="mt-0.5 text-[13px] text-muted">{b.date} {b.startTime} · {b.hours}시간 · {b.grade}등급</div></div>
                  <Badge text={label[0]} bg={label[1]} color={label[2]} />
                </div>
                <div className="text-[13px] text-muted">📍 {b.address}</div>
                <div className="mt-1.5 font-serif text-[16px] font-bold text-terra-2">정산 예정 {won(payout)}</div>
                {st === 'MATCHED' && <button onClick={() => checkIn(b.id)} className="mt-2.5 w-full rounded-xl bg-pine py-3 text-[14px] font-bold text-white">근무 시작 (GPS 출근)</button>}
                {st === 'IN_PROGRESS' && (
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <button onClick={() => { patch({ workerBookingId: b.id }); go('worker-carelog'); }} className="rounded-xl border-[1.5px] border-line bg-cream py-3 text-[14px] font-bold text-pine">📝 육아일지</button>
                    <button onClick={() => complete(b.id)} className="rounded-xl bg-pine py-3 text-[14px] font-bold text-white">근무 완료</button>
                  </div>
                )}
              </div>
            );
          })
        : <div className="py-5 text-center text-[14px] text-muted">아직 배정된 근무가 없습니다</div>}
    </Body>
  );
}

/* ================= 근무자 육아일지 작성 ================= */
export function WorkerCareLog() {
  const { draft, go } = useApp();
  const [note, setNote] = useState('');
  const [tick, setTick] = useState(0);

  async function add(type: string) {
    const bid = draft.workerBookingId;
    if (!bid) return;
    const memo = note.trim();
    if (type === 'note' && !memo) return alert('메모를 입력하세요');
    const text = memo || (CARE_TYPES.find((t) => t.key === type)?.label || '');
    try { await api.addCareLog(bid, type, text); setNote(''); setTick((t) => t + 1); }
    catch (e: any) { alert('기록 실패: ' + e.message); }
  }
  async function finish() {
    if (api.isLoggedIn() && draft.workerBookingId) {
      try { await api.complete(draft.workerBookingId); } catch (e: any) { return alert('완료 실패: ' + e.message); }
    }
    go('worker-home');
  }

  return (
    <>
      <Body>
        <TopBar back="worker-home" title="육아일지 작성" />
        <div className="mb-3.5 text-[13px] text-muted">활동을 누르면 현재 시각으로 기록됩니다</div>
        <div className="grid grid-cols-3 gap-2">
          {CARE_TYPES.map((t) => (
            <button key={t.key} onClick={() => add(t.key)} className="rounded-xl border-[1.5px] border-line bg-cream py-3 text-center text-[14px] font-semibold text-ink hover:border-terra">{t.icon} {t.label}</button>
          ))}
        </div>
        <div className="mb-2 mt-4 text-[13px] font-bold text-ink-2">메모 (선택 — 활동과 함께 기록)</div>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="예) 120ml 수유" />
        <button onClick={() => add('note')} className="mt-2 w-full rounded-2xl border-[1.5px] border-line bg-cream py-3.5 text-[14px] font-bold text-pine">📝 메모만 기록</button>
        <Label>작성된 기록</Label>
        <CareLogList bookingId={draft.workerBookingId} refreshKey={tick} />
      </Body>
      <Foot><NextButton onClick={finish}>근무 완료</NextButton></Foot>
    </>
  );
}
