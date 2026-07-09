'use client';

import { useEffect, useState } from 'react';
import { api, AuthUserInfo } from '@/lib/api';
import { AppProvider, useApp } from './context';
import { Login, SignupChoice, SignupParent, SignupWorker } from './screens/auth';
import {
  ParentHome, ParentBookings, ParentCareLog,
  GradeSelect, DateSelect, TimeSelect, AddressChild, Pay, Matching, Matched, Active, Review, Done, WorkerDetail, SafetyInfo,
} from './screens/parent';
import { WorkerHome, WorkerCareLog } from './screens/worker';
import { AdminHome } from './screens/admin';

function Router() {
  const { screen } = useApp();
  switch (screen) {
    case 'login': return <Login />;
    case 'signup-choice': return <SignupChoice />;
    case 'signup-parent': return <SignupParent />;
    case 'signup-worker': return <SignupWorker />;
    case 'parent-home': return <ParentHome />;
    case 'parent-bookings': return <ParentBookings />;
    case 'parent-carelog': return <ParentCareLog />;
    case 'grade': return <GradeSelect />;
    case 'date': return <DateSelect />;
    case 'time': return <TimeSelect />;
    case 'address': return <AddressChild />;
    case 'pay': return <Pay />;
    case 'matching': return <Matching />;
    case 'matched': return <Matched />;
    case 'worker-detail': return <WorkerDetail />;
    case 'safety-info': return <SafetyInfo />;
    case 'active': return <Active />;
    case 'review': return <Review />;
    case 'done': return <Done />;
    case 'worker-home': return <WorkerHome />;
    case 'worker-carelog': return <WorkerCareLog />;
    case 'admin-home': return <AdminHome />;
    default: return <Login />;
  }
}

export function MomCareApp() {
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);
  const [initialUser, setInitialUser] = useState<AuthUserInfo | null>(null);

  useEffect(() => {
    const u = api.getUser();
    if (api.isLoggedIn() && u) setInitialUser(u);
    setReady(true);
    // 서버 콜드 스타트 대비: 깨어날 때까지 재확인(폴링). 연결되면 자동으로 live=true
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      const ok = await api.check();
      if (cancelled) return;
      if (ok) { setLive(true); return; }
      attempts += 1;
      if (attempts < 30) setTimeout(poll, 3000); // 최대 ~90초 동안 재시도
    };
    poll();
    return () => { cancelled = true; };
  }, []);

  if (!ready) return <div className="flex min-h-0 flex-1 flex-col bg-ivory" />;

  return (
    <AppProvider live={live} initialUser={initialUser}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-ivory">
        <Router />
      </div>
    </AppProvider>
  );
}
