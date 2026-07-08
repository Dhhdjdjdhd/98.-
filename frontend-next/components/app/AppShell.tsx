// 앱 셸 — 폰 너비 컬럼 (데스크톱 폰 프레임/모바일 전체화면은 이후 단계에서 고도화)
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-ivory">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[420px] flex-col bg-ivory">
        {children}
      </div>
    </div>
  );
}
