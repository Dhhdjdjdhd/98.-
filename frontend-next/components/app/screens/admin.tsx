'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
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
  const [summary, setSummary] = useState<any>({ pending: '—', approved: '—', totalBookings: '—' });
  const [pending, setPending] = useState<any[] | null>(null);
  const [view, setView] = useState<string | null>(null); // 확대 이미지 dataUrl

  async function reload() {
    if (!live || !user) { setPending([]); return; }
    try {
      const [sum, list]: any = await Promise.all([api.summary(), api.listWorkers('PENDING')]);
      setSummary(sum);
      setPending(list);
    } catch {}
  }
  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function decide(userId: string, approve: boolean) {
    try {
      if (approve) await api.approveWorker(userId);
      else await api.rejectWorker(userId, '서류 미비');
      setPending((p) => (p ? p.filter((w) => w.userId !== userId) : p));
      const sum: any = await api.summary();
      setSummary(sum);
    } catch (e: any) {
      alert((approve ? '승인' : '반려') + ' 실패: ' + e.message);
    }
  }

  return (
    <Body>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-pine">🛡️ 관리자 콘솔</h3>
        <button onClick={logout} title="로그아웃" className="grid h-[34px] w-[34px] place-items-center rounded-full bg-ivory-2">🚪</button>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        {[['승인 대기', summary.pending], ['활동 전문가', summary.approved], ['예약 총계', summary.totalBookings]].map(([l, v], i) => (
          <div key={i} className="rounded-[13px] border border-line bg-cream px-2.5 py-3.5 text-center">
            <b className="block font-serif text-[22px] text-pine">{v}</b>
            <span className="text-[11px] text-muted">{l}</span>
          </div>
        ))}
      </div>

      <div className="mb-3 text-[12px] font-bold uppercase tracking-wide text-muted">자격 검수 대기</div>
      {pending === null ? <div className="py-5 text-center text-[14px] text-muted">불러오는 중…</div>
        : pending.length ? pending.map((w) => <ApproveCard key={w.userId} w={w} onDecide={decide} onView={setView} />)
        : <div className="py-6 text-center text-[14px] text-muted">승인 대기 중인 근무자가 없습니다 ✓</div>}

      {view && (
        <div onClick={() => setView(null)} className="fixed inset-0 z-[99999] grid cursor-zoom-out place-items-center bg-black/80 p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={view} alt="서류" className="max-h-[90%] max-w-[92%] rounded-xl" />
        </div>
      )}
    </Body>
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
