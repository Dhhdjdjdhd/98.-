'use client';

import { cn } from '@/lib/utils';
import { useApp, ScreenName } from './context';

// 스크롤 본문
export function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex-1 overflow-y-auto px-5 pb-5 pt-4', className)}>{children}</div>;
}

// 하단 고정 버튼 영역
export function Foot({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-line bg-cream px-5 pb-5 pt-3.5">{children}</div>;
}

// 전체 폭 다음 버튼
export function NextButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-[15px] bg-terra py-4 text-[15.5px] font-bold text-white transition hover:bg-terra-2 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
    >
      {children}
    </button>
  );
}

// 상단바(뒤로 + 제목)
export function TopBar({ back, title, right }: { back?: ScreenName; title: string; right?: React.ReactNode }) {
  const { go } = useApp();
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={() => go(back)}
            className="grid h-[34px] w-[34px] place-items-center rounded-full border border-line bg-cream text-[16px] text-pine"
          >
            ←
          </button>
        )}
        <h3 className="font-serif text-[18px] font-bold text-pine">{title}</h3>
      </div>
      {right}
    </div>
  );
}

// 예약 진행바 (1~5)
export function Progress({ step }: { step: number }) {
  return (
    <div className="mb-5 flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn('h-[5px] flex-1 rounded-full', i <= step ? 'bg-terra' : 'bg-line')} />
      ))}
    </div>
  );
}

// 섹션 라벨
export function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 mt-5 text-[12px] font-bold uppercase tracking-wide text-muted">{children}</div>;
}

// 질문 헤딩
export function Q({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-5">
      <div className="font-serif text-[22px] font-bold leading-tight text-pine">{children}</div>
      {sub && <div className="mt-1.5 text-[13px] text-muted">{sub}</div>}
    </div>
  );
}

// 상태 뱃지
export function Badge({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <span className="rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={{ background: bg, color }}>
      {text}
    </span>
  );
}

// 선택 옵션 버튼
export function OptButton({
  selected,
  onClick,
  children,
}: {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3.5 rounded-[15px] border-[1.5px] bg-cream px-[18px] py-4 text-left transition',
        selected ? 'border-terra bg-[#FCEFE9]' : 'border-line hover:border-terra',
      )}
    >
      {children}
    </button>
  );
}
