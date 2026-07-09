'use client';

import { useEffect, useState } from 'react';
import { api, AuthUserInfo } from '@/lib/api';
import { AppProvider, useApp } from './context';
import { Login, SignupChoice, SignupParent, SignupWorker } from './screens/auth';
import {
  ParentHome, ParentBookings, ParentCareLog,
  GradeSelect, DateSelect, TimeSelect, AddressChild, SelectWorker, Pay, Matching, Matched, Active, Review, Done, WorkerDetail, SafetyInfo,
} from './screens/parent';
import { WorkerHome, WorkerCareLog, WorkerObservation } from './screens/worker';
import { AdminHome } from './screens/admin';

function Router() {
  const { screen, go, patch } = useApp();
  // 토스 결제 성공/실패 리다이렉트 처리
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const result = params.get('toss');
    if (!result) return;
    window.history.replaceState({}, '', window.location.pathname); // URL 정리
    if (result === 'fail') { alert('결제가 취소되었습니다.'); return; }
    const paymentKey = params.get('paymentKey') || '';
    const orderId = params.get('orderId') || '';
    const amount = Number(params.get('amount') || 0);
    if (!paymentKey || !orderId) return;
    (async () => {
      try {
        const res: any = await api.confirmPayment(orderId, paymentKey, amount);
        patch({ bookingId: orderId, grade: res.booking?.grade });
        if (res.matched) {
          const worker: any = await api.getWorker(res.workerId);
          patch({ matchedWorker: worker });
          go('matched');
        } else {
          patch({ matchedWorker: null });
          alert('결제는 완료됐지만 지금 조건에 맞는 전문가가 없어요.\n예약내역에서 확인하세요.');
          go('parent-bookings');
        }
      } catch (e: any) {
        alert('결제 승인 실패: ' + (e?.message || e));
        go('parent-home');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
    case 'select-worker': return <SelectWorker />;
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
    case 'worker-observation': return <WorkerObservation />;
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
