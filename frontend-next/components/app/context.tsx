'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, AuthUserInfo } from '@/lib/api';
import { GradeCode, applyGradePrices } from '@/lib/constants';

export type ScreenName =
  | 'login' | 'signup-choice' | 'signup-parent' | 'signup-worker'
  | 'parent-home' | 'parent-bookings' | 'parent-carelog'
  | 'grade' | 'date' | 'time' | 'address' | 'select-worker' | 'pay' | 'matching' | 'matched' | 'active' | 'review' | 'done' | 'worker-detail' | 'safety-info'
  | 'worker-home' | 'worker-carelog' | 'worker-observation'
  | 'admin-home';

export interface Draft {
  grade?: GradeCode;
  dates: number[]; // 선택한 날짜(7월 일자) 목록 — 여러 날짜 묶음 예약
  time?: string;
  hours: number;
  address: string;
  childAge?: { value: string; label: string };
  selectedWorker?: any;     // 부모가 직접 선택한 전문가 (userId 포함)
  bookingId?: string;
  groupId?: string;         // 여러 날짜 묶음 예약 ID (묶음 취소용)
  matchedWorker?: any;
  rating: number;
  reviewTags: string[];
  workerBookingId?: string; // 근무자 육아일지 대상
  viewBookingId?: string;   // 부모 육아일지 열람 대상
  detailBack?: ScreenName;  // 상세 이력 화면의 뒤로가기 목적지
  safetyBack?: ScreenName;  // 안전·보험 안내 화면의 뒤로가기 목적지
  activeBack?: ScreenName;  // 근무 현황 화면의 뒤로가기 목적지
}

const emptyDraft: Draft = { hours: 2, address: '', rating: 0, reviewTags: [], dates: [] };

interface AppState {
  screen: ScreenName;
  go: (s: ScreenName) => void;
  user: AuthUserInfo | null;
  live: boolean;
  onAuthed: (u: AuthUserInfo) => void;
  logout: () => void;
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  resetDraft: () => void;
}

const Ctx = createContext<AppState | null>(null);
export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
};

function roleHome(role: string): ScreenName {
  return role === 'WORKER' ? 'worker-home' : role === 'ADMIN' ? 'admin-home' : 'parent-home';
}

export function AppProvider({
  live,
  initialUser,
  children,
}: {
  live: boolean;
  initialUser: AuthUserInfo | null;
  children: React.ReactNode;
}) {
  const [screen, setScreen] = useState<ScreenName>(initialUser ? roleHome(initialUser.role) : 'login');
  const [user, setUser] = useState<AuthUserInfo | null>(initialUser);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [, setPriceTick] = useState(0); // 서버 시급 반영 후 리렌더 트리거

  // 앱 로드 시 관리자가 설정한 등급 시급을 서버에서 받아 GRADES에 반영
  useEffect(() => {
    api.gradePricing()
      .then((m: any) => { applyGradePrices(m); setPriceTick((x) => x + 1); })
      .catch(() => {});
  }, []);

  const go = useCallback((s: ScreenName) => setScreen(s), []);
  const patch = useCallback((p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p })), []);
  const resetDraft = useCallback(() => setDraft(emptyDraft), []);

  const onAuthed = useCallback((u: AuthUserInfo) => {
    setUser(u);
    setScreen(roleHome(u.role));
  }, []);
  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setDraft(emptyDraft);
    setScreen('login');
  }, []);

  return (
    <Ctx.Provider value={{ screen, go, user, live, onAuthed, logout, draft, patch, resetDraft }}>
      {children}
    </Ctx.Provider>
  );
}
