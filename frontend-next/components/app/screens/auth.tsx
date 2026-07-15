'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { resizeImage } from '@/lib/image';
import { useApp } from '../context';
import { Body, Foot, NextButton, TopBar } from '../ui';
import { Input, Field } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Villy } from '@/components/brand/Villy';
import { SignaturePad } from '@/components/ui/SignaturePad';

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
        <Villy size={84} className="mx-auto" />
        <h1 className="mt-1 font-serif text-2xl font-bold text-pine">케어빌리지</h1>
        <p className="mt-1 text-[13px] text-muted">한 아이를 키우는 온 마을, 빌리와 함께</p>
        <div
          className={
            'mt-3 inline-block rounded-full border px-3 py-1 text-[12px] font-semibold ' +
            (live ? 'border-[#C9E0D2] bg-[#E9F0EC] text-pine' : 'border-line bg-[#EEF2F6] text-[#5A6B7B]')
          }
        >
          {live ? '🟢 실서버 연동 중' : '🔵 서버 준비 중… (첫 접속은 시간이 걸려요)'}
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

/* ===== 부모(산모) 가입 ===== */
export function SignupParent() {
  const { onAuthed, live } = useApp();
  const [f, setF] = useState({
    name: '', phone: '', password: '', address: '',
    birthDate: '', job: '', allergy: '', pastHistory: '',
    infectiousDisease: '', familyHistory: '', specialNotes: '',
  });
  const [deliveries, setDeliveries] = useState<{ date: string; gender: string }[]>([]);
  const [showConsent, setShowConsent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const inputCls = 'w-full min-w-0 box-border rounded-xl border-[1.5px] border-line bg-cream px-3.5 py-2.5 text-[14px] outline-none focus:border-terra';

  const addDelivery = () => setDeliveries([...deliveries, { date: '', gender: '딸' }]);
  const setDelivery = (i: number, patch: Partial<{ date: string; gender: string }>) =>
    setDeliveries(deliveries.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const removeDelivery = (i: number) => setDeliveries(deliveries.filter((_, idx) => idx !== i));

  // 1단계: 정보 검증 후 고지 의무 동의서 모달 열기
  function toConsent() {
    if (!live) return alert('데모 모드에서는 회원가입을 사용할 수 없습니다.');
    const required: [string, string][] = [
      ['name', '이름'], ['phone', '휴대폰 번호'], ['password', '비밀번호'], ['address', '주소'],
      ['birthDate', '생년월일'], ['job', '직업'], ['allergy', '알러지'], ['pastHistory', '과거력'],
      ['infectiousDisease', '전염성 질환'], ['familyHistory', '가족력'], ['specialNotes', '특이사항'],
    ];
    for (const [k, label] of required) {
      if (!(f as any)[k]?.trim()) return alert(`${label}을(를) 입력해 주세요.\n(건강 항목은 없으면 "없음"으로 입력)`);
    }
    if (f.password.length < 4) return alert('비밀번호는 4자 이상이어야 합니다.');
    if (deliveries.some((d) => !d.date)) return alert('분만 이력의 출산일을 입력하거나 항목을 삭제해 주세요.');
    setSignature('');
    setAgreed(false);
    setShowConsent(true);
  }

  // 2단계: 동의 + 서명 완료 후 가입
  async function finalSubmit() {
    if (!agreed) return alert('고지 의무 내용에 동의해 주세요.');
    if (!signature) return alert('서명을 입력해 주세요.');
    setBusy(true);
    try {
      onAuthed(await api.signupParent({ ...f, deliveries, consentSignature: signature }));
    } catch (e: any) {
      alert('가입 실패: ' + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Body>
        <TopBar back="signup-choice" title="부모(산모) 회원가입" />

        <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">기본 정보</div>
        <Field label="이름"><Input value={f.name} onChange={set('name')} placeholder="예) 김미영" /></Field>
        <Field label="생년월일"><Input type="date" value={f.birthDate} onChange={set('birthDate')} className="min-w-0 box-border appearance-none" /></Field>
        <Field label="휴대폰 번호"><Input value={f.phone} onChange={set('phone')} placeholder="010-0000-0000" /></Field>
        <Field label="비밀번호 (4자 이상)"><Input type="password" value={f.password} onChange={set('password')} /></Field>
        <Field label="주소"><Input value={f.address} onChange={set('address')} placeholder="서울시 강남구 ..." /></Field>
        <Field label="직업"><Input value={f.job} onChange={set('job')} placeholder="예) 회사원" /></Field>

        <div className="mb-2 mt-3 text-[12px] font-bold uppercase tracking-wide text-muted">건강 정보 <span className="font-normal normal-case">(없으면 "없음" 입력)</span></div>
        <Field label="알러지"><Input value={f.allergy} onChange={set('allergy')} placeholder="예) 견과류, 없음" /></Field>
        <Field label="과거력"><Input value={f.pastHistory} onChange={set('pastHistory')} placeholder="예) 고혈압, 당뇨, 갑상선질환 등" /></Field>
        <Field label="전염성 질환"><Input value={f.infectiousDisease} onChange={set('infectiousDisease')} placeholder="예) B형간염 보균, 없음" /></Field>
        <Field label="가족력"><Input value={f.familyHistory} onChange={set('familyHistory')} placeholder="예) 부: 고혈압, 모: 유방암 등" /></Field>

        <div className="mb-1.5 mt-3 text-[12px] font-bold uppercase tracking-wide text-muted">분만 이력</div>
        {deliveries.map((d, i) => (
          <div key={i} className="mb-2 flex items-center gap-2">
            <input type="date" value={d.date} onChange={(e) => setDelivery(i, { date: e.target.value })} className={inputCls} />
            <select value={d.gender} onChange={(e) => setDelivery(i, { gender: e.target.value })} className={inputCls + ' w-24 shrink-0'}>
              <option>딸</option><option>아들</option>
            </select>
            <button type="button" onClick={() => removeDelivery(i)} className="shrink-0 rounded-lg border border-line px-2.5 py-2 text-[13px] text-muted">×</button>
          </div>
        ))}
        <button type="button" onClick={addDelivery} className="mb-3 w-full rounded-xl border-[1.5px] border-dashed border-line py-2.5 text-[13px] font-semibold text-pine">+ 분만 이력 추가 (초산이면 비워두세요)</button>

        <div className="mb-1.5 mt-1 text-[12px] font-bold uppercase tracking-wide text-muted">특이사항 · 주의할 점 · 바라는 점</div>
        <textarea value={f.specialNotes} onChange={set('specialNotes')} rows={3} placeholder="돌봄 시 주의할 점이나 바라는 점을 적어주세요. (없으면 '없음')" className={inputCls + ' resize-none'} />
      </Body>
      <Foot><NextButton onClick={toConsent}>다음 · 고지 의무 동의</NextButton></Foot>

      {/* ===== 고지 의무 동의서 모달 ===== */}
      {showConsent && (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/50 p-4">
          <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white">
            <div className="border-b border-line px-5 py-4">
              <h3 className="text-[16px] font-extrabold text-pine">이용자의 고지 의무 동의서</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 text-[13px] leading-relaxed text-ink-2">
              <p className="mb-3">이용자는 안전한 돌봄 서비스 제공을 위해, <b className="text-ink">산모 본인·아기 또는 함께 거주하는 가족</b>의 전염성 질환, 감염병, 기타 돌봄에 영향을 줄 수 있는 건강상 특이사항이 있는 경우 이를 <b className="text-ink">서비스 이용 전 전문가에게 반드시 알려야 합니다.</b></p>
              <p className="mb-3">고지되지 않은 사항으로 인해 발생하는 안전상의 문제나 서비스 제공의 어려움에 대해서는 이용자가 책임을 질 수 있으며, 전문가는 본인과 다른 이용자의 안전을 위해 서비스 제공을 제한하거나 중단할 수 있습니다.</p>

              <label className="mt-1 flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-cream px-3.5 py-3">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-terra" />
                <span className="text-[13px] font-semibold text-ink">위 고지 의무 내용을 모두 확인했으며 이에 동의합니다.</span>
              </label>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-muted">서명 (본인)</span>
                  <span className="text-[12px] text-ink">{f.name || '이름'}</span>
                </div>
                <SignaturePad onChange={setSignature} />
              </div>
            </div>
            <div className="flex gap-2 border-t border-line px-5 py-3.5">
              <button type="button" onClick={() => setShowConsent(false)} className="flex-1 rounded-xl border-[1.5px] border-line bg-cream py-3 text-[14px] font-bold text-muted">취소</button>
              <button type="button" onClick={finalSubmit} disabled={busy || !agreed || !signature} className="flex-[1.6] rounded-xl bg-pine py-3 text-[14px] font-bold text-white disabled:opacity-50">동의하고 가입 완료</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===== 근무자 가입 ===== */
const WORKER_DOCS: [string, string][] = [
  ['license', '면허/자격증'],
  ['career', '경력증명서'],
  ['idCard', '신분증'],
  ['criminalCheck', '범죄경력 조회'],
  ['childAbuseCheck', '아동학대 조회'],
  ['healthCert', '보건증'],
];

export function SignupWorker() {
  const { onAuthed, live } = useApp();
  const [f, setF] = useState({ name: '', phone: '', password: '', grade: 'B', careerYears: '3', careerNote: '', bankName: '', accountNumber: '', accountHolder: '' });
  const [license, setLicense] = useState('간호사');
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function uploadDoc(kind: string) {
    const file = fileRefs.current[kind]?.files?.[0];
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
        bankName: f.bankName, accountNumber: f.accountNumber, accountHolder: f.accountHolder,
      });
      for (const [kind] of WORKER_DOCS) await uploadDoc(kind);
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
        <div className="mb-3 mt-2 text-[12px] font-bold uppercase tracking-wide text-muted">정산 계좌 (급여 입금용)</div>
        <Field label="은행"><Input value={f.bankName} onChange={set('bankName')} placeholder="예) 국민은행" /></Field>
        <Field label="계좌번호"><Input value={f.accountNumber} onChange={set('accountNumber')} placeholder="'-' 없이 숫자만" /></Field>
        <Field label="예금주"><Input value={f.accountHolder} onChange={set('accountHolder')} placeholder="예) 김서연" /></Field>
        <div className="mb-3 mt-2 text-[12px] font-bold uppercase tracking-wide text-muted">서류 첨부 (이미지)</div>
        {WORKER_DOCS.map(([kind, label]) => (
          <Field key={kind} label={label}>
            <input ref={(el) => { fileRefs.current[kind] = el; }} type="file" accept="image/*" className="w-full rounded-xl border-[1.5px] border-line bg-cream p-2.5 text-[13px]" />
          </Field>
        ))}
      </Body>
      <Foot><NextButton onClick={submit}>가입 신청 (승인 대기)</NextButton></Foot>
    </>
  );
}
