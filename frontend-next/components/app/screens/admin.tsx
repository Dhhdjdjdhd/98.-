'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { won, pad2 } from '@/lib/utils';
import { resizeImage } from '@/lib/image';
import { CHILD_AGES, BOOKING_STATUS } from '@/lib/constants';
import { useApp } from '../context';
import { Body } from '../ui';

const DOC_CHIPS: [string, string][] = [
  ['license', '면허/자격증'],
  ['career', '경력증명'],
  ['idCard', '신분증'],
  ['criminalCheck', '범죄경력'],
  ['childAbuseCheck', '아동학대'],
  ['healthCert', '보건증'],
];

export function AdminHome() {
  const { user, live, logout } = useApp();
  const [tab, setTab] = useState<'approve' | 'settle' | 'obs' | 'bookings'>('approve');
  const [summary, setSummary] = useState<any>({ pending: '—', approved: '—', totalBookings: '—' });
  const [pending, setPending] = useState<any[] | null>(null);
  const [workerFilter, setWorkerFilter] = useState<'PENDING' | 'APPROVED'>('PENDING');
  const [settlements, setSettlements] = useState<any[] | null>(null);
  const [observations, setObservations] = useState<any[] | null>(null);
  const [allBookings, setAllBookings] = useState<any[] | null>(null);
  const [view, setView] = useState<string | null>(null); // 확대 이미지 dataUrl

  async function loadSummary() { try { setSummary(await api.summary()); } catch {} }
  async function loadWorkers() {
    if (!live || !user) { setPending([]); return; }
    try { setPending(await api.listWorkers(workerFilter)); } catch { setPending([]); }
  }
  useEffect(() => { if (live && user) loadSummary(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => {
    if (tab === 'approve' && live && user) { setPending(null); loadWorkers(); }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [tab, workerFilter]);

  async function loadSettlements() {
    try { setSettlements(await api.pendingSettlements()); } catch { setSettlements([]); }
  }
  async function loadObservations() {
    try { setObservations(await api.adminObservations()); } catch { setObservations([]); }
  }
  async function loadAllBookings() {
    try { setAllBookings(await api.adminBookings()); } catch { setAllBookings([]); }
  }
  useEffect(() => {
    if (tab === 'settle' && settlements === null && live && user) loadSettlements();
    if (tab === 'obs' && observations === null && live && user) loadObservations();
    if (tab === 'bookings' && allBookings === null && live && user) loadAllBookings();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [tab]);
  const bkCounts: Record<string, number> = allBookings
    ? allBookings.reduce((m: Record<string, number>, b) => { m[b.status] = (m[b.status] || 0) + 1; return m; }, {})
    : {};
  // 특징 태그 빈도 집계
  const tagCounts: [string, number][] = observations
    ? Object.entries(
        observations.flatMap((o) => o.tags || []).reduce((m: Record<string, number>, t: string) => { m[t] = (m[t] || 0) + 1; return m; }, {}),
      ).sort((a, b) => (b[1] as number) - (a[1] as number)) as [string, number][]
    : [];

  async function decide(userId: string, approve: boolean) {
    try {
      if (approve) await api.approveWorker(userId);
      else await api.rejectWorker(userId, '서류 미비');
      setPending((p) => (p ? p.filter((w) => w.userId !== userId) : p));
      loadSummary();
    } catch (e: any) {
      alert((approve ? '승인' : '반려') + ' 실패: ' + e.message);
    }
  }
  async function doSettle(bookingId: string) {
    if (!confirm('이 근무의 정산(근무자 입금)을 승인할까요?')) return;
    try { await api.settle(bookingId); loadSettlements(); }
    catch (e: any) { alert('정산 실패: ' + e.message); }
  }
  const settlePending = settlements ? settlements.filter((s) => s.paymentStatus !== 'SETTLED') : [];
  // 정산 완료는 근무 종료일 기준 최근 2주(14일)만 노출
  const _cut = new Date(Date.now() - 14 * 86400000);
  const settleCutoff = `${_cut.getFullYear()}-${pad2(_cut.getMonth() + 1)}-${pad2(_cut.getDate())}`;
  const settleDone = settlements
    ? settlements.filter((s) => s.paymentStatus === 'SETTLED' && String(s.checkOutAt || '').slice(0, 10) >= settleCutoff)
    : [];
  const settleCard = (s: any, done: boolean) => (
    <div key={s.bookingId} className="mb-3 rounded-2xl border border-line bg-cream p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <b className="text-[15px] text-pine">{s.workerName || '전문가'} <span className="font-normal text-muted">→</span> {s.parentName}</b>
          <div className="mt-0.5 text-[12.5px] text-muted">{s.date} {s.startTime} · {s.hours}시간 · {s.grade}등급</div>
        </div>
        {done && <span className="shrink-0 rounded-full bg-[#EEF2F6] px-2.5 py-1 text-[11px] font-semibold text-[#5A6B7B]">정산완료</span>}
      </div>
      <div className="rounded-xl bg-ivory-2 p-3 text-[13px]">
        <div className="flex justify-between py-0.5"><span className="text-muted">부모 결제액</span><b className="text-ink">{won(s.base)}</b></div>
        <div className="flex justify-between py-0.5"><span className="text-muted">플랫폼 수수료(15%)</span><span className="text-muted">− {won(s.feeAmount)}</span></div>
        <div className="mt-1 flex justify-between border-t border-line pt-1.5"><span className="font-bold text-ink">근무자 정산액</span><b className="font-serif text-[15px] text-terra-2">{won(s.workerPayout)}</b></div>
      </div>
      {!done && <button onClick={() => doSettle(s.bookingId)} className="mt-2.5 w-full rounded-xl bg-pine py-3 text-[14px] font-bold text-white">💸 근무자에게 입금 (정산 완료)</button>}
    </div>
  );

  return (
    <Body>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-pine">🛡️ 관리자 콘솔</h3>
        <button onClick={logout} title="로그아웃" className="grid h-[34px] w-[34px] place-items-center rounded-full bg-ivory-2">🚪</button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {[['승인 대기', summary.pending], ['활동 전문가', summary.approved], ['예약 총계', summary.totalBookings]].map(([l, v], i) => (
          <div key={i} className="rounded-[13px] border border-line bg-cream px-2.5 py-3.5 text-center">
            <b className="block font-serif text-[22px] text-pine">{v}</b>
            <span className="text-[11px] text-muted">{l}</span>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="mb-4 flex gap-1 rounded-xl bg-ivory-2 p-1">
        {([['approve', '자격 검수'], ['settle', '정산'], ['obs', '비고'], ['bookings', '예약']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={'flex-1 rounded-lg py-2 text-[13px] font-bold transition ' + (tab === k ? 'bg-white text-pine shadow-sm' : 'text-muted')}>{l}</button>
        ))}
      </div>

      {tab === 'approve' && (
        <>
          <div className="mb-3 flex gap-2">
            {([['PENDING', '승인 대기'], ['APPROVED', '활동 중']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setWorkerFilter(k)} className={'rounded-full border-[1.5px] px-3.5 py-1.5 text-[12.5px] font-semibold transition ' + (workerFilter === k ? 'border-terra bg-terra text-white' : 'border-line bg-cream text-ink')}>{l}</button>
            ))}
          </div>
          {pending === null ? <div className="py-5 text-center text-[14px] text-muted">불러오는 중…</div>
            : pending.length ? pending.map((w) => (
                workerFilter === 'PENDING'
                  ? <ApproveCard key={w.userId} w={w} onDecide={decide} onView={setView} />
                  : <WorkerInfoCard key={w.userId} w={w} onChanged={() => { loadWorkers(); loadSummary(); }} onView={setView} />
              ))
            : <div className="py-6 text-center text-[14px] text-muted">{workerFilter === 'PENDING' ? '승인 대기 중인 근무자가 없습니다 ✓' : '활동 중인 전문가가 없습니다'}</div>}
        </>
      )}

      {tab === 'settle' && (
        settlements === null ? <div className="py-5 text-center text-[14px] text-muted">불러오는 중…</div>
          : settlements.length === 0 ? <div className="py-6 text-center text-[14px] text-muted">완료된 근무(정산 대상)가 없습니다</div>
          : (
            <>
              <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">정산 대기 ({settlePending.length})</div>
              {settlePending.length ? settlePending.map((s) => settleCard(s, false))
                : <div className="mb-3 rounded-2xl border border-dashed border-line py-4 text-center text-[13px] text-muted">정산 대기 중인 근무가 없습니다 ✓</div>}
              {settleDone.length > 0 && (
                <>
                  <div className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-wide text-muted">정산 완료 · 최근 2주 ({settleDone.length})</div>
                  <div className="opacity-60">{settleDone.map((s) => settleCard(s, true))}</div>
                </>
              )}
            </>
          )
      )}

      {tab === 'obs' && (
        observations === null ? <div className="py-5 text-center text-[14px] text-muted">불러오는 중…</div>
          : observations.length ? (
            <>
              <div className="mb-3 rounded-2xl border border-line bg-cream p-3.5">
                <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">특징 태그 빈도</div>
                {tagCounts.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tagCounts.map(([t, n]) => <span key={t} className="rounded-full bg-ivory-2 px-2.5 py-1 text-[12px] text-ink-2">{t} <b className="text-pine">{n}</b></span>)}
                  </div>
                ) : <div className="text-[12.5px] text-muted">선택된 태그가 없어요</div>}
              </div>
              {observations.map((o) => (
                <div key={o.id} className="mb-2.5 rounded-2xl border border-line bg-cream p-3.5">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <b className="text-[14px] text-pine">{o.parentName || '부모'} · {CHILD_AGES[o.childAge] || '아이'}</b>
                    <span className="shrink-0 text-[11px] text-muted">{o.workerName || ''} · {String(o.createdAt || '').slice(0, 10)}</span>
                  </div>
                  {o.tags?.length > 0 && (
                    <div className="mb-1.5 flex flex-wrap gap-1.5">
                      {o.tags.map((t: string) => <span key={t} className="rounded-full bg-ivory-2 px-2 py-0.5 text-[11.5px] font-semibold text-ink-2">{t}</span>)}
                    </div>
                  )}
                  {o.note && <p className="text-[13px] leading-relaxed text-ink-2">{o.note}</p>}
                </div>
              ))}
            </>
          )
          : <div className="py-6 text-center text-[14px] text-muted">아직 등록된 관찰 비고가 없습니다</div>
      )}

      {tab === 'bookings' && (
        allBookings === null ? <div className="py-5 text-center text-[14px] text-muted">불러오는 중…</div>
          : allBookings.length ? (
            <>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {(['REQUESTED', 'MATCHED', 'IN_PROGRESS', 'DONE', 'CANCELED'] as const).map((s) => (
                  <span key={s} className="rounded-full bg-ivory-2 px-2.5 py-1 text-[12px] text-ink-2">{BOOKING_STATUS[s]?.[0]} <b className="text-pine">{bkCounts[s] || 0}</b></span>
                ))}
              </div>
              {allBookings.map((b) => (
                <div key={b.id} className="mb-2.5 rounded-2xl border border-line bg-cream p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <b className="text-[14px] text-pine">{b.parentName || '부모'} <span className="font-normal text-muted">→ {b.workerName || '미배정'}</span></b>
                      <div className="mt-0.5 text-[12.5px] text-muted">{CHILD_AGES[b.childAge] || '아이'} · {b.date} {b.startTime} · {b.hours}시간 · {b.grade}등급</div>
                    </div>
                    <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: BOOKING_STATUS[b.status]?.[1] || '#eee', color: BOOKING_STATUS[b.status]?.[2] || '#888' }}>{BOOKING_STATUS[b.status]?.[0] || b.status}</span>
                  </div>
                </div>
              ))}
            </>
          )
          : <div className="py-6 text-center text-[14px] text-muted">예약이 없습니다</div>
      )}

      {view && (
        <div onClick={() => setView(null)} className="fixed inset-0 z-[99999] grid cursor-zoom-out place-items-center bg-black/80 p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={view} alt="서류" className="max-h-[90%] max-w-[92%] rounded-xl" />
        </div>
      )}
    </Body>
  );
}

function WorkerInfoCard({ w, onChanged, onView }: { w: any; onChanged: () => void; onView: (src: string) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [docFiles, setDocFiles] = useState<Record<string, string>>(w.docFiles || {});
  const [f, setF] = useState({
    name: w.name || '',
    licenseType: w.licenseType || '간호사',
    careerYears: String(w.careerYears ?? ''),
    careerNote: w.careerNote || '',
    grade: w.grade || 'B',
  });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  async function replaceDoc(kind: string, file: File) {
    setBusy(true);
    try {
      const dataUrl = await resizeImage(file);
      const res: any = await api.uploadFile(kind, dataUrl, 'image/jpeg');
      const next = { ...docFiles, [kind]: res.id };
      await api.updateWorkerProfile(w.userId, { docFiles: next });
      setDocFiles(next);
      onChanged();
    } catch (e: any) { alert('업로드 실패: ' + e.message); }
    finally { setBusy(false); }
  }
  async function save() {
    setBusy(true);
    try {
      await api.updateWorkerProfile(w.userId, {
        name: f.name.trim(),
        licenseType: f.licenseType,
        careerYears: parseInt(f.careerYears || '0', 10),
        careerNote: f.careerNote.trim(),
        grade: f.grade,
      });
      alert('수정되었습니다.');
      onChanged();
    } catch (e: any) { alert('수정 실패: ' + e.message); }
    finally { setBusy(false); }
  }
  async function suspend() {
    if (!confirm(`${w.name} 전문가를 활동 정지(반려)할까요?\n승인 대기 목록으로 이동하며 배정이 중단됩니다.`)) return;
    setBusy(true);
    try { await api.rejectWorker(w.userId, '관리자 활동 정지'); onChanged(); }
    catch (e: any) { alert('정지 실패: ' + e.message); }
    finally { setBusy(false); }
  }
  const inputCls = 'w-full rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-[14px] outline-none focus:border-terra';
  return (
    <div className="mb-3 rounded-2xl border border-line bg-cream p-4">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 text-left">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber to-terra text-xl">👩‍⚕️</div>
        <div className="min-w-0 flex-1">
          <b className="text-[15px]">{w.name || '이름미상'}</b>
          <span className="block truncate text-[12px] text-muted">{w.licenseType} · {w.grade}등급 · {w.careerNote || w.careerYears + '년'}</span>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-serif text-[15px] font-bold text-pine">⭐ {w.ratingAvg ?? '-'}</div>
          <div className="text-[11px] text-muted">돌봄 {w.careCount ?? 0}회</div>
        </div>
        <span className="shrink-0 text-[12px] text-muted">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2.5 border-t border-line pt-3">
          <div>
            <label className="mb-1 block text-[12px] font-bold text-muted">이름</label>
            <input value={f.name} onChange={set('name')} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-bold text-muted">자격</label>
            <div className="flex gap-2">
              {['간호사', '간호조무사'].map((l) => (
                <button key={l} onClick={() => setF({ ...f, licenseType: l })} className={'flex-1 rounded-xl border-[1.5px] py-2.5 text-[13px] font-semibold transition ' + (f.licenseType === l ? 'border-terra bg-[#FCEFE9] text-pine' : 'border-line bg-white text-ink')}>{l}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[12px] font-bold text-muted">경력(년)</label>
              <input type="number" value={f.careerYears} onChange={set('careerYears')} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-bold text-muted">등급</label>
              <div className="flex gap-1">
                {['A', 'B', 'C', 'D'].map((g) => (
                  <button key={g} onClick={() => setF({ ...f, grade: g })} className={'flex-1 rounded-lg border-[1.5px] py-2.5 text-[13px] font-bold transition ' + (f.grade === g ? 'border-terra bg-terra text-white' : 'border-line bg-white text-ink')}>{g}</button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-bold text-muted">경력 요약</label>
            <input value={f.careerNote} onChange={set('careerNote')} placeholder="예) 신생아실 7년" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-bold text-muted">첨부 서류 (누르면 확대 · 교체 가능)</label>
            <div className="grid grid-cols-3 gap-2">
              {DOC_CHIPS.map(([k, label]) => (
                <div key={k} className="rounded-xl border border-line bg-white p-2 text-center">
                  <div className="mb-1 truncate text-[10.5px] font-semibold text-ink-2">{label}</div>
                  {docFiles[k]
                    ? <DocThumb fileId={docFiles[k]} onView={onView} />
                    : <div className="mx-auto grid h-[52px] w-[52px] place-items-center rounded-lg bg-ivory-2 text-[10px] text-muted">없음</div>}
                  <label className="mt-1 block cursor-pointer rounded-lg border border-line bg-cream py-1 text-[10.5px] font-semibold text-pine">
                    {docFiles[k] ? '교체' : '업로드'}
                    <input type="file" accept="image/*" disabled={busy} className="hidden" onChange={(e) => e.target.files?.[0] && replaceDoc(k, e.target.files[0])} />
                  </label>
                </div>
              ))}
            </div>
          </div>
          <button onClick={save} disabled={busy} className="w-full rounded-xl bg-pine py-3 text-[14px] font-bold text-white disabled:opacity-50">저장</button>
          <button onClick={suspend} disabled={busy} className="w-full rounded-xl border-[1.5px] border-line bg-cream py-2.5 text-[13px] font-bold text-muted disabled:opacity-50">활동 정지 (반려 처리)</button>
        </div>
      )}
    </div>
  );
}

function ApproveCard({ w, onDecide, onView }: { w: any; onDecide: (id: string, a: boolean) => void; onView: (src: string) => void }) {
  const d = w.docs || {};
  const files: [string, string][] = Object.entries(w.docFiles || {});
  return (
    <div className="mb-3 rounded-2xl border border-line bg-cream p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-amber to-terra text-xl">👩‍⚕️</div>
        <div><b className="text-[15px]">{w.name || '이름미상'}</b><span className="block text-[12px] text-muted">{w.licenseType} · {w.grade}등급 신청 · {w.careerNote || w.careerYears + '년'}</span></div>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {DOC_CHIPS.map(([k, label]) => (
          <span key={k} className={'rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ' + (d[k] ? 'bg-[#E9F0EC] text-pine' : 'bg-[#FBF1E0] text-[#B57F2E]')}>{d[k] ? '✓' : '⏳'} {label}</span>
        ))}
      </div>
      {files.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {files.map(([, fid]) => <DocThumb key={fid} fileId={fid} onView={onView} />)}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onDecide(w.userId, false)} className="rounded-xl border-[1.5px] border-line bg-cream py-3 text-[13.5px] font-bold text-muted">반려</button>
        <button onClick={() => onDecide(w.userId, true)} className="rounded-xl bg-pine py-3 text-[13.5px] font-bold text-white">승인</button>
      </div>
    </div>
  );
}

function DocThumb({ fileId, onView }: { fileId: string; onView: (src: string) => void }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    api.getFile(fileId).then((f: any) => alive && setSrc(f.dataUrl)).catch(() => {});
    return () => { alive = false; };
  }, [fileId]);
  if (!src) return <div className="h-[52px] w-[52px] rounded-lg border border-line bg-ivory-2" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="서류" onClick={() => onView(src)} className="h-[52px] w-[52px] cursor-pointer rounded-lg border border-line object-cover" />;
}
