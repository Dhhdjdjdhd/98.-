'use client';

import { useState } from 'react';
import { api, AuthUserInfo } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Field } from '@/components/ui/input';

const DEMO_ROLES: { role: 'parent' | 'worker' | 'admin'; icon: string; label: string; sub: string }[] = [
  { role: 'parent', icon: '👨‍👩‍👧', label: '부모로 체험', sub: '예약·매칭·리뷰' },
  { role: 'worker', icon: '🩺', label: '근무자로 체험', sub: '예약요청·수입' },
  { role: 'admin', icon: '🛡️', label: '관리자로 체험', sub: '자격 승인' },
];

export function LoginScreen({
  live,
  onAuthed,
}: {
  live: boolean;
  onAuthed: (u: AuthUserInfo) => void;
}) {
  const [phone, setPhone] = useState('010-1111-1111');
  const [pw, setPw] = useState('test1234');
  const [busy, setBusy] = useState(false);

  async function doLogin() {
    if (!live) {
      alert('서버 미연결 상태입니다. 아래 "데모 계정으로 체험"을 이용하세요.');
      return;
    }
    setBusy(true);
    try {
      onAuthed(await api.login(phone.trim(), pw));
    } catch (e: any) {
      alert('로그인 실패: ' + e.message);
    } finally {
      setBusy(false);
    }
  }

  async function quick(role: 'parent' | 'worker' | 'admin') {
    setBusy(true);
    try {
      onAuthed(await api.loginDemo(role));
    } catch (e: any) {
      alert('데모 로그인 실패: ' + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-6 pt-8">
      <div className="pb-2 pt-2 text-center">
        <div className="text-[44px]">🤱</div>
        <h1 className="mt-2 font-serif text-2xl font-bold text-pine">맘케어 로그인</h1>
        <p className="mt-1 text-[13px] text-muted">검증된 전문가와 함께하세요</p>
        <div
          className={
            'mt-3 inline-block rounded-full border px-3 py-1 text-[12px] font-semibold ' +
            (live
              ? 'border-[#C9E0D2] bg-[#E9F0EC] text-pine'
              : 'border-line bg-[#EEF2F6] text-[#5A6B7B]')
          }
        >
          {live ? '🟢 실서버 연동 중' : '🔵 서버 확인 중…'}
        </div>
      </div>

      <div className="mt-4">
        <Field label="휴대폰 번호">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1111-1111" />
        </Field>
        <Field label="비밀번호">
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="비밀번호" />
        </Field>
        <Button className="w-full" disabled={busy} onClick={doLogin}>
          로그인
        </Button>
      </div>

      <div className="my-4 flex items-center gap-2.5">
        <div className="h-px flex-1 bg-line" />
        <span className="text-[12px] text-muted">데모 계정으로 바로 체험</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="flex flex-col gap-2.5">
        {DEMO_ROLES.map((d) => (
          <button
            key={d.role}
            disabled={busy}
            onClick={() => quick(d.role)}
            className="flex items-center gap-3.5 rounded-[15px] border-[1.5px] border-line bg-cream px-4 py-4 text-left transition hover:border-terra disabled:opacity-50"
          >
            <span className="text-2xl">{d.icon}</span>
            <span className="flex-1">
              <b className="block text-[15px]">{d.label}</b>
              <span className="text-[12.5px] text-muted">{d.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
