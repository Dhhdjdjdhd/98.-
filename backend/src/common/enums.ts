// 도메인 열거형 및 비즈니스 상수

export enum Role {
  PARENT = 'PARENT', // 부모(이용자)
  WORKER = 'WORKER', // 근무자(간호사/간호조무사)
  ADMIN = 'ADMIN', // 관리자
}

// 근무자 등급 (기획서 4단계 등급제)
export enum Grade {
  A = 'A', // 간호사 · 신생아 전문
  B = 'B', // 간호사 · 일반
  C = 'C', // 간호조무사 · 신생아
  D = 'D', // 간호조무사 · 일반
}

export enum LicenseType {
  NURSE = '간호사',
  ASSISTANT_NURSE = '간호조무사',
}

// 근무자 승인 상태 (관리자 검수)
export enum WorkerStatus {
  PENDING = 'PENDING', // 승인 대기
  APPROVED = 'APPROVED', // 활동 가능
  REJECTED = 'REJECTED', // 반려
}

// 아이 나이 구분 (신생아 100일 미만 / 6개월 / 돌 이후)
export enum ChildAge {
  NEWBORN = 'NEWBORN', // 신생아
  INFANT = 'INFANT', // 영아
  TODDLER = 'TODDLER', // 돌 이후
}

// 예약 진행 상태
export enum BookingStatus {
  REQUESTED = 'REQUESTED', // 예약 요청(결제 전)
  MATCHED = 'MATCHED', // 결제 완료 + 근무자 매칭됨
  IN_PROGRESS = 'IN_PROGRESS', // 근무 중(출근 체크)
  DONE = 'DONE', // 근무 완료
  CANCELED = 'CANCELED', // 취소
}

// 결제/정산 상태
export enum PaymentStatus {
  PENDING = 'PENDING', // 결제 대기
  PAID = 'PAID', // 결제 완료
  SETTLED = 'SETTLED', // 근무자 정산 완료
  REFUNDED = 'REFUNDED', // 환불
}

// 등급별 시급 (원)
export const GRADE_HOURLY: Record<Grade, number> = {
  [Grade.A]: 50000,
  [Grade.B]: 30000,
  [Grade.C]: 30000,
  [Grade.D]: 20000,
};

// 플랫폼 중개 수수료율 (근무자 정산액에서 차감, 기획서 10~20%)
export const PLATFORM_FEE_RATE = 0.15;

// JSON 저장소 컬렉션 이름 (파일명과 1:1)
export const COLLECTIONS = {
  USERS: 'users',
  PARENTS: 'parentProfiles',
  WORKERS: 'workerProfiles',
  BOOKINGS: 'bookings',
  PAYMENTS: 'payments',
  REVIEWS: 'reviews',
  FILES: 'files',
  CARE_LOGS: 'careLogs',
  OBSERVATIONS: 'observations',
} as const;

// 근무자 제출 서류 종류 (파일 업로드 kind)
export const DOC_KINDS = [
  'license', // 면허/자격증
  'career', // 경력증명
  'idCard', // 신분증
  'criminalCheck', // 범죄경력
  'childAbuseCheck', // 아동학대
  'healthCert', // 보건증
] as const;
