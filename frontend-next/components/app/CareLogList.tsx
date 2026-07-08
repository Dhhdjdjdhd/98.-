'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CARE_TYPES } from '@/lib/constants';

export function CareLogList({ bookingId, refreshKey = 0 }: { bookingId?: string; refreshKey?: number }) {
  const [logs, setLogs] = useState<any[] | null>(null);

  useEffect(() => {
    let alive = true;
    if (!bookingId) {
      setLogs([]);
      return;
    }
    api
      .listCareLog(bookingId)
      .then((l) => alive && setLogs(l as any[]))
      .catch(() => alive && setLogs([]));
    return () => {
      alive = false;
    };
  }, [bookingId, refreshKey]);

  if (logs === null) return <div className="text-[13px] text-muted">불러오는 중…</div>;
  if (!logs.length) return <div className="text-[13px] text-muted">아직 작성된 기록이 없습니다</div>;

  return (
    <div className="rounded-2xl border border-line bg-cream p-4">
      {logs.map((log) => {
        const t = CARE_TYPES.find((x) => x.key === log.type);
        const time = (log.createdAt || '').slice(11, 16);
        const icon = t ? t.icon + ' ' : log.type === 'note' ? '📝 ' : '';
        return (
          <div key={log.id} className="flex gap-3 py-[9px] text-[13.5px]">
            <span className="min-w-[42px] font-serif text-[13px] font-bold text-terra">{time}</span>
            <span className="text-ink-2">
              {icon}
              {log.note || (t ? t.label : '')}
            </span>
          </div>
        );
      })}
    </div>
  );
}
