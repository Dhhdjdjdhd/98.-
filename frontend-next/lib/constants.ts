export type GradeCode = 'A' | 'B' | 'C' | 'D';

export const GRADES: Record<GradeCode, { code: GradeCode; name: string; price: number; badge: string; desc: string }> = {
  A: { code: 'A', name: '간호사 · 신생아 전문', price: 50000, badge: '#D96C4A', desc: '신생아실·산후병동 경력' },
  B: { code: 'B', name: '간호사 · 일반', price: 30000, badge: '#2E5A50', desc: '병동 근무 간호사' },
  C: { code: 'C', name: '간호조무사 · 신생아', price: 30000, badge: '#E6A15B', desc: '신생아·산후조리 경험' },
  D: { code: 'D', name: '간호조무사 · 일반', price: 20000, badge: '#6E7B62', desc: '일반 경력 조무사' },
};
export const GRADE_ORDER: GradeCode[] = ['A', 'B', 'C', 'D'];

export const CHILD_AGES: Record<string, string> = {
  NEWBORN: '신생아',
  INFANT: '영아',
  TODDLER: '돌 이후',
};
export const CHILD_AGE_OPTS: [string, string, string, string][] = [
  ['👶', '신생아', '100일 미만', 'NEWBORN'],
  ['🍼', '영아', '6개월', 'INFANT'],
  ['🧸', '돌 이후', '12개월+', 'TODDLER'],
];

export const CARE_TYPES: { key: string; label: string; icon: string }[] = [
  { key: 'feeding', label: '수유', icon: '🍼' },
  { key: 'diaper', label: '기저귀', icon: '🧷' },
  { key: 'sleep', label: '수면', icon: '💤' },
  { key: 'bath', label: '목욕', icon: '🛁' },
  { key: 'play', label: '놀이', icon: '🧸' },
  { key: 'meal', label: '이유식', icon: '🥣' },
];

// 근무자 관찰 비고용 — 흔한 아이 특징 태그
export const CHILD_TRAITS: string[] = [
  '낯가림', '분리불안', '활발해요', '순해요', '수줍음',
  '알레르기 있음', '편식', '특정 음식 거부',
  '낮잠 규칙적', '밤에 자주 깸', '배변훈련 중', '투약 필요', '특정 장난감 선호',
];

// 상태 → [라벨, 배경, 글자색]
export const BOOKING_STATUS: Record<string, [string, string, string]> = {
  REQUESTED: ['결제대기', '#FBF1E0', '#B57F2E'],
  MATCHED: ['매칭완료', '#FCEFE9', '#C0532F'],
  IN_PROGRESS: ['근무중', '#E9F0EC', '#16443C'],
  DONE: ['완료', '#EEF2F6', '#5A6B7B'],
  CANCELED: ['취소', '#F3EDED', '#B0757A'],
};
