'use client';

import { useEffect, useState } from 'react';
import { api, AuthUserInfo } from '@/lib/api';
import { LoginScreen } from './screens/LoginScreen';
import { Button } from '@/components/ui/button';

type Screen = 'login' | 'parent-home' | 'worker-home' | 'admin-home';

function roleHome(role: string): Screen {
  return role === 'WORKER' ? 'worker-home' : role === 'ADMIN' ? 'admin-home' : 'parent-home';
}

// 폰 스크린(mc-screen)을 채우는 앱 컨테이너
function Shell({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-ivory">{children}</div>;
}

export function MomCareApp() {
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState<AuthUserInfo | null>(null);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = api.getUser();
    if (api.isLoggedIn() && u) {
      setUser(u);
      setScreen(roleHome(u.role));
    }
    setReady(true);
    api.check().then(setLive);
  }, []);

  function onAuthed(u: AuthUserInfo) {
    setUser(u);
    setScreen(roleHome(u.role));
  }
  function logout() {
    api.logout();
    setUser(null);
    setScreen('login');
  }

  if (!ready) return <Shell><div className="flex-1" /></Shell>;

  return (
    <Shell>
      {screen === 'login' && <LoginScreen live={live} onAuthed={onAuthed} />}
      {screen !== 'login' && user && <PlaceholderHome user={user} onLogout={logout} />}
    </Shell>
  );
}

// 임시 홈 (다음 단계에서 부모/근무자/관리자 실제 화면으로 교체)
function PlaceholderHome({ user, onLogout }: { user: AuthUserInfo; onLogout: () => void }) {
  const roleKo = user.role === 'PARENT' ? '부모' : user.role === 'WORKER' ? '근무자' : '관리자';
  return (
    <div className="flex-1 overflow-y-auto px-5 pb-6 pt-10 text-center">
      <div className="text-[44px]">✅</div>
      <h2 className="mt-3 font-serif text-2xl font-bold text-pine">로그인 성공</h2>
      <p className="mt-2 text-[15px] text-ink-2">
        {user.name}님 ({roleKo}) 으로 접속했습니다.
      </p>
      <p className="mt-1 text-[13px] text-muted">
        이 화면은 임시입니다. 다음 단계에서 실제 {roleKo} 화면을 이식합니다.
      </p>
      <Button variant="ghost" className="mt-6" onClick={onLogout}>
        로그아웃
      </Button>
    </div>
  );
}
