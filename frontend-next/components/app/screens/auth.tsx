'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { resizeImage } from '@/lib/image';
import { useApp } from '../context';
import { Body, Foot, NextButton, TopBar } from '../ui';
import { Input, Field } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/* ===== 로그인 ===== */
const DEMO_ROLES: { role: 'parent' | 'worker' | 'admin'; icon: string; label: string; sub: string }[] = [
  { role: 'parent', icon: '👨‍👩‍👧', label: '부모로 체험', sub: '예약·매칭·리뷰' },
  { role: 'worker', icon: '🩺', label: '근무자로 체험', sub: '예약요청·수입' },
  { role: 'admin', icon: '🛡️', label: '관리자로 체험', sub: '자격 승인' },
];

export function Login() {
  const { live, onAuthed, go } = useApp();
  const [phone, setPhone] = useState('010-1111-1111');
  const [pw, setPw] = useState('test1234');
  const [busy, setBusy] = useState(false);

  async function doLogin() {
    if (!live) return alert('서버 미연결 상태입니다. 아래 "데모 계정으로 체험"을 이용하세요.');
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
    <Body className="pt-8">
      <div className="pb-2 text-center">
        <div className="text-[44px]">🤱</div>
        <h1 className="mt-2 font-serif text-2xl font-bold text-pine">맘케어 로그인</h1>
        <p className="mt-1 text-[13px] text-muted">검증된 전문가와 함께하세요</p>
        <div
          className={
            'mt-3 inline-block rounded-full border px-3 py-1 text-[12px] font-semibold ' +
            (live ? 'border-[#C9E0D2] bg-[#E9F0EC] text-pine' : 'border-line bg-[#EEF2F6] text-[#5A6B7B]')
          }
        >
          {live ? '🟢 실서버 연동 중' : '🔵 서버 확인 중…'}
        </div>
      </div>
      <div className="mt-4">
        <Field label="휴대폰 번호">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="비밀번호">
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        <Button className="w-full" disabled={busy} onClick={doLogin}>
          로그인
        </Button>
      </div>
      <div className="my-4 text-center text-[13px] text-muted">
        계정이 없으신가요?{' '}
        <button className="font-bold text-terra" onClick={() => go('signup-choice')}>
          회원가입
        </button>
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
    </Body>
  );
}

/* ===== 회원가입 선택 ===== */
export function SignupChoice() {
  const { go } = useApp();
  return (
    <Body>
      <TopBar back="login" title="회원가입" />
      <div className="mb-5">
        <div className="font-serif text-[22px] font-bold leading-tight text-pine">어떤 회원으로<br />가입하시나요?</div>
        <div className="mt-1.5 text-[13px] text-muted">부모 또는 돌봄 전문가를 선택하세요</div>
      </div>
      <div className="flex flex-col gap-2.5">
        <ChoiceBtn icon="👨‍👩‍👧" title="부모 회원" sub="돌봄을 받고 싶어요" onClick={() => go('signup-parent')} />
        <ChoiceBtn icon="🩺" title="근무자 회원" sub="간호사·간호조무사" onClick={() => go('signup-worker')} />
      </div>
    </Body>
  );
}
function ChoiceBtn({ icon, title, sub, onClick }: { icon: string; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 rounded-[15px] border-[1.5px] border-line bg-cream px-4 py-4 text-left transition hover:border-terra"
    >
      <span className="text-2xl">{icon}</span>
      <span className="flex-1">
        <b className="block text-[15px]">{title}</b>
        <span className="text-[12.5px] text-muted">{sub}</span>
      </span>
    </button>
  );
}

/* ===== 부모 가입 ===== */
export function SignupParent() {
  const { onAuthed, live } = useApp();
  const [f, setF] = useState({ name: '', phone: '', password: '', address: '' });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function submit() {
    if (!live) return alert('데모 모드에서는 회원가입을 사용할 수 없습니다.');
    if (!f.name || !f.phone || !f.password || !f.address) return alert('모든 항목을 입력하세요.');
    try {
      onAuthed(await api.signupParent(f));
    } catch (e: any) {
      alert('가입 실패: ' + e.message);
    }
  }

  return (
    <>
      <Body>
        <TopBar back="signup-choice" title="부모 회원가입" />
        <Field label="이름"><Input value={f.name} onChange={set('name')} placeholder="예) 지민맘" /></Field>
        <Field label="휴대폰 번호"><Input value={f.phone} onChange={set('phone')} placeholder="010-0000-0000" /></Field>
        <Field label="비밀번호 (4자 이상)"><Input type="password" value={f.password} onChange={set('password')} /></Field>
        <Field label="주소"><Input value={f.address} onChange={set('address')} placeholder="서울시 강남구 ..." /></Field>
      </Body>
      <Foot><NextButton onClick={submit}>가입하고 시작하기</NextButton></Foot>
    </>
  );
}

/* ===== 근무자 가입 ===== */
export function SignupWorker() {
  const { onAuthed, live } = useApp();
  const [f, setF] = useState({ name: '', phone: '', password: '', grade: 'B', careerYears: '3', careerNote: '' });
  const [license, setLicense] = useState('간호사');
  const licenseRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function upload(ref: React.RefObject<HTMLInputElement>, kind: string) {
    const file = ref.current?.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      await api.uploadFile(kind, dataUrl, 'image/jpeg');
    } catch (e) {
      console.warn(kind, e);
    }
  }

  async function submit() {
    if (!live) return alert('데모 모드에서는 회원가입을 사용할 수 없습니다.');
    const grade = f.grade.toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(grade)) return alert('등급은 A / B / C / D 중 하나여야 합니다.');
    if (!f.name || !f.phone || !f.password) return alert('이름·휴대폰·비밀번호를 입력하세요.');
    try {
      const u = await api.signupWorker({
        name: f.name, phone: f.phone, password: f.password,
        licenseType: license, grade, careerYears: parseInt(f.careerYears || '0', 10), careerNote: f.careerNote,
      });
      await upload(licenseRef, 'license');
      await upload(idRef, 'idCard');
      alert('가입 신청 완료! 관리자 승인 후 활동할 수 있어요.');
      onAuthed(u);
    } catch (e: any) {
      alert('가입 실패: ' + e.message);
    }
  }

  return (
    <>
      <Body>
        <TopBar back="signup-choice" title="근무자 회원가입" />
        <Field label="이름"><Input value={f.name} onChange={set('name')} placeholder="예) 김서연" /></Field>
        <Field label="휴대폰 번호"><Input value={f.phone} onChange={set('phone')} placeholder="010-0000-0000" /></Field>
        <Field label="비밀번호 (4자 이상)"><Input type="password" value={f.password} onChange={set('password')} /></Field>
        <div className="mb-3 mt-2 text-[12px] font-bold uppercase tracking-wide text-muted">자격</div>
        <div className="flex gap-2">
          {['간호사', '간호조무사'].map((l) => (
            <button
              key={l}
              onClick={() => setLicense(l)}
              className={
                'flex-1 rounded-xl border-[1.5px] py-3 text-[14px] font-semibold transition ' +
                (license === l ? 'border-terra bg-[#FCEFE9] text-pine' : 'border-line bg-cream text-ink-2')
              }
            >
              {l}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Field label="희망 등급 (A/B/C/D)"><Input value={f.grade} onChange={set('grade')} /></Field>
          <Field label="경력 (년)"><Input type="number" value={f.careerYears} onChange={set('careerYears')} /></Field>
          <Field label="경력 요약"><Input value={f.careerNote} onChange={set('careerNote')} placeholder="예) 신생아실 3년" /></Field>
        </div>
        <div className="mb-3 mt-2 text-[12px] font-bold uppercase tracking-wide text-muted">서류 첨부 (이미지)</div>
        <Field label="면허/자격증"><input ref={licenseRef} type="file" accept="image/*" className="w-full rounded-xl border-[1.5px] border-line bg-cream p-2.5 text-[13px]" /></Field>
        <Field label="신분증"><input ref={idRef} type="file" accept="image/*" className="w-full rounded-xl border-[1.5px] border-line bg-cream p-2.5 text-[13px]" /></Field>
      </Body>
      <Foot><NextButton onClick={submit}>가입 신청 (승인 대기)</NextButton></Foot>
    </>
  );
}
