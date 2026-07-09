'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { won } from '@/lib/utils';
import { GRADES, GradeCode, CHILD_AGES, CARE_TYPES, CHILD_TRAITS } from '@/lib/constants';
import { useApp } from '../context';
import { Body, Foot, NextButton, TopBar, Label, Badge } from '../ui';
import { Input } from '@/components/ui/input';
import { CareLogList } from '../CareLogList';

/* ================= 근무자 홈 ================= */
export function WorkerHome() {
  const { user, live, logout, go, patch } = useApp();
  const [data, setData] = useState<{ earn: number; count: number; rating: any; grade: any; bookings: any[] } | null>(null);
  const [tick, setTick] = useState(0);
  const [showUpcoming, setShowUpcoming] = useState<boolean | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!live || !user) { setData(null); return; }
      try {
        const [settle, detail, bookings]: any = await Promise.all([
          api.settlement(user.id), api.getWorker(user.id), api.listBookings({ workerId: user.id }),
        ]);
        const visible = bookings.filter((b: any) => b.status !== 'CANCELED').reverse();
        // 배정된 예약마다 예약자(부모) 연락처 병렬 조회
        const withContact = await Promise.all(
          visible.map(async (b: any) => {
            try { return { ...b, parent: await api.bookingContact(b.id) }; } catch { return b; }
          }),
        );
        if (alive) setData({
          earn: settle.totalPayout, count: settle.completedCount,
          rating: detail.profile?.ratingAvg ?? '-', grade: detail.profile?.grade ?? '',
          bookings: withContact,
        });
      } catch {}
    })();
    return () => { alive = false; };
  }, [live, user, tick]);

  async function accept(id: string) {
    try { await api.accept(id); setTick((t) => t + 1); } catch (e: any) { alert('수락 실패: ' + e.message); }
  }
  async function reject(id: string) {
    if (!confirm('이 배정을 거절하시겠어요? 다른 근무자에게 재배정됩니다.')) return;
    try { await api.reject(id); setTick((t) => t + 1); } catch (e: any) { alert('거절 실패: ' + e.message); }
  }
  async function checkIn(id: string) {
    try { await api.checkIn(id); setTick((t) => t + 1); } catch (e: any) { alert('근무 시작 실패: ' + e.message); }
  }
  // 근무 카드 렌더
  const renderCard = (b: any) => {
    const st = b.status;
    const accepted = !!b.workerAccepted;
    const payout = Math.round((GRADES[b.grade as GradeCode]?.price || 0) * b.hours * 0.85);
    const label: [string, string, string] = st === 'MATCHED'
      ? (accepted ? ['수락됨', '#E9F0EC', '#16443C'] : ['수락 대기', '#FCEFE9', '#C0532F'])
      : st === 'IN_PROGRESS' ? ['근무중', '#E9F0EC', '#16443C'] : ['완료', '#EEF2F6', '#5A6B7B'];
    return (
      <div key={b.id} className="mb-3 rounded-2xl border border-line bg-cream p-4">
        <div className="mb-3 flex items-start justify-between">
          <div><h4 className="text-[16px] font-extrabold text-pine">{CHILD_AGES[b.childAge] || '아이'} 돌봄</h4><div className="mt-0.5 text-[13px] text-muted">{b.date} {b.startTime} · {b.hours}시간 · {b.grade}등급</div></div>
          <Badge text={label[0]} bg={label[1]} color={label[2]} />
        </div>
        <div className="text-[13px] text-muted">📍 {b.address}</div>
        {b.parent && (
          <div className="mt-2 flex items-center justify-between rounded-xl bg-ivory-2 px-3 py-2">
            <div className="text-[13px] leading-tight">
              <span className="text-muted">예약자</span> <b className="text-ink">{b.parent.name}</b>
              <div className="text-[12.5px] text-muted">{b.parent.phone}</div>
            </div>
            <a href={`tel:${b.parent.phone}`} className="shrink-0 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-bold text-pine">📞 전화</a>
          </div>
        )}
        <div className="mt-1.5 font-serif text-[16px] font-bold text-terra-2">정산 예정 {won(payout)}</div>
        {st === 'MATCHED' && !accepted && (
          <div className="mt-2.5 grid grid-cols-[1fr_1.6fr] gap-2">
            <button onClick={() => reject(b.id)} className="rounded-xl border-[1.5px] border-line bg-cream py-3 text-[14px] font-bold text-muted">거절</button>
            <button onClick={() => accept(b.id)} className="rounded-xl bg-terra py-3 text-[14px] font-bold text-white">수락하기</button>
          </div>
        )}
        {st === 'MATCHED' && accepted && <button onClick={() => checkIn(b.id)} className="mt-2.5 w-full rounded-xl bg-pine py-3 text-[14px] font-bold text-white">근무 시작</button>}
        {st === 'IN_PROGRESS' && (
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button onClick={() => { patch({ workerBookingId: b.id }); go('worker-carelog'); }} className="rounded-xl border-[1.5px] border-line bg-cream py-3 text-[14px] font-bold text-pine">📝 육아일지</button>
            <button onClick={() => { patch({ workerBookingId: b.id }); go('worker-observation'); }} className="rounded-xl bg-pine py-3 text-[14px] font-bold text-white">📋 특징·비고</button>
          </div>
        )}
      </div>
    );
  };

  // 근무중 / 근무 예정 / 근무 이력 3구분
  const bks = data?.bookings ?? [];
  const asc = (a: any, b: any) => (a.date + a.startTime).localeCompare(b.date + b.startTime);
  const desc = (a: any, b: any) => (b.date + b.startTime).localeCompare(a.date + a.startTime);
  const active = bks.filter((b: any) => b.status === 'IN_PROGRESS').sort(asc);
  const upcoming = bks.filter((b: any) => b.status === 'MATCHED').sort(asc);
  const history = bks.filter((b: any) => b.status === 'DONE').sort(desc);
  const upcomingOpen = showUpcoming ?? active.length === 0; // 근무중 있으면 기본 접힘

  const SectionToggle = ({ title, count, open, onToggle }: { title: string; count: number; open: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="mt-1 flex w-full items-center justify-between py-2 text-left">
      <span className="text-[13px] font-bold uppercase tracking-wide text-muted">{title} ({count})</span>
      <span className="text-[12px] text-muted">{open ? '접기 ▴' : '펼치기 ▾'}</span>
    </button>
  );

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
        : active.length + upcoming.length + history.length === 0 ? <div className="py-5 text-center text-[14px] text-muted">아직 배정된 근무가 없습니다</div>
        : (
          <>
            {active.length > 0 && (
              <>
                <div className="mb-2 mt-1 text-[13px] font-bold uppercase tracking-wide text-pine">🩺 근무중 ({active.length})</div>
                {active.map(renderCard)}
              </>
            )}
            {upcoming.length > 0 && (
              <>
                <SectionToggle title="근무 예정" count={upcoming.length} open={upcomingOpen} onToggle={() => setShowUpcoming(!upcomingOpen)} />
                {upcomingOpen && upcoming.map(renderCard)}
              </>
            )}
            {history.length > 0 && (
              <>
                <SectionToggle title="근무 이력" count={history.length} open={showHistory} onToggle={() => setShowHistory((v) => !v)} />
                {showHistory && <div className="opacity-70">{history.map(renderCard)}</div>}
              </>
            )}
          </>
        )}
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
  function finish() {
    // 근무 완료(종료)는 부모가 확정 — 근무자는 일지만 저장하고 닫는다
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
      <Foot><NextButton onClick={finish}>저장하고 닫기</NextButton></Foot>
    </>
  );
}

/* ================= 아이 특징 · 비고 (관리자 분석용) ================= */
export function WorkerObservation() {
  const { draft, go } = useApp();
  const [tags, setTags] = useState<string[]>([]);
  const [obsNote, setObsNote] = useState('');
  const [saved, setSaved] = useState<any[]>([]);
  const toggle = (t: string) => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  function load() {
    if (draft.workerBookingId) api.listBookingObservations(draft.workerBookingId).then((r: any) => setSaved(Array.isArray(r) ? r : [])).catch(() => {});
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [draft.workerBookingId]);
  async function save() {
    const bid = draft.workerBookingId;
    if (!bid) return;
    if (tags.length === 0 && !obsNote.trim()) return alert('특징을 선택하거나 비고를 입력하세요.');
    try {
      await api.addObservation(bid, obsNote.trim(), tags);
      setTags([]); setObsNote('');
      load();
      alert('저장되었습니다. 관리자 분석에 활용됩니다.');
    } catch (e: any) { alert('저장 실패: ' + e.message); }
  }
  async function removeObs(obsId: string) {
    if (!confirm('이 비고를 삭제할까요?')) return;
    try { await api.deleteObservation(obsId); load(); } catch (e: any) { alert('삭제 실패: ' + e.message); }
  }
  return (
    <>
      <Body>
        <TopBar back="worker-home" title="아이 특징 · 비고" />
        <div className="mb-3 rounded-xl bg-ivory-2 p-3.5 text-[12.5px] leading-relaxed text-muted">아이·부모의 특이사항을 남겨주세요. 관리자가 분석해 다음 돌봄에 참고합니다. <b className="text-ink-2">부모에게는 노출되지 않아요.</b></div>
        <Label>해당하는 특징 (복수 선택)</Label>
        <div className="flex flex-wrap gap-2">
          {CHILD_TRAITS.map((t) => (
            <button key={t} onClick={() => toggle(t)} className={'rounded-full border-[1.5px] px-3.5 py-2 text-[13px] font-semibold transition ' + (tags.includes(t) ? 'border-terra bg-terra text-white' : 'border-line bg-cream text-ink hover:border-terra')}>{t}</button>
          ))}
        </div>
        <Label>기타 · 자유 비고</Label>
        <textarea value={obsNote} onChange={(e) => setObsNote(e.target.value)} rows={4} placeholder="예) 특정 인형을 좋아해요 · 낮잠 시간 규칙적 · 특이사항 없음" className="w-full rounded-xl border-[1.5px] border-line bg-cream p-3 text-[14px] leading-relaxed text-ink outline-none focus:border-terra" />
        <button onClick={save} className="mt-2 w-full rounded-2xl bg-terra py-3 text-[14px] font-bold text-white">비고 저장</button>

        <Label>작성된 비고{saved.length ? ` (${saved.length})` : ''}</Label>
        {saved.length ? saved.map((o) => (
          <div key={o.id} className="mb-2 rounded-xl border border-line bg-cream p-3">
            {o.tags?.length > 0 && (
              <div className="mb-1.5 flex flex-wrap gap-1.5">
                {o.tags.map((t: string) => <span key={t} className="rounded-full bg-ivory-2 px-2.5 py-1 text-[11.5px] font-semibold text-ink-2">{t}</span>)}
              </div>
            )}
            {o.note && <p className="text-[13.5px] text-ink-2">{o.note}</p>}
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[11px] text-muted">{o.createdAt}</span>
              <button onClick={() => removeObs(o.id)} className="text-[12px] font-semibold text-muted hover:text-terra-2">삭제</button>
            </div>
          </div>
        )) : <div className="py-3 text-[13px] text-muted">아직 작성된 비고가 없어요</div>}
      </Body>
      <Foot><NextButton onClick={() => go('worker-home')}>닫기</NextButton></Foot>
    </>
  );
}
