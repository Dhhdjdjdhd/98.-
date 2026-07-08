'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { api, AuthUserInfo } from '@/lib/api';
import { GradeCode } from '@/lib/constants';

export type ScreenName =
  | 'login' | 'signup-choice' | 'signup-parent' | 'signup-worker'
  | 'parent-home' | 'parent-bookings' | 'parent-carelog'
  | 'grade' | 'date' | 'time' | 'address' | 'pay' | 'matching' | 'matched' | 'active' | 'review' | 'done'
  | 'worker-home' | 'worker-carelog'
  | 'admin-home';

export interface Draft {
  grade?: GradeCode;
  date?: number;
  time?: string;
  hours: number;
  address: string;
  childAge?: { value: string; label: string };
  bookingId?: string;
  matchedWorker?: any;
  rating: number;
  reviewTags: string[];
  workerBookingId?: string; // 근무자 육아일지 대상
  viewBookingId?: string;   // 부모 육아일지 열람 대상
}

const emptyDraft: Draft = { hours: 2, address: '', rating: 0, reviewTags: [] };

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
