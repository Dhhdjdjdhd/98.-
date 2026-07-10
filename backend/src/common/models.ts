// 도메인 모델(엔티티) 타입 정의
// JSON 저장소에 그대로 직렬화되는 형태. 관계는 id 참조로 표현한다.

import {
  Role,
  Grade,
  LicenseType,
  WorkerStatus,
  ChildAge,
  BookingStatus,
  PaymentStatus,
} from './enums';

// 공통 사용자(부모/근무자/관리자 공통 인증 정보)
export interface User {
  id: string;
  role: Role;
  phone: string;
  name: string;
  passwordHash?: string; // bcrypt 해시 (응답 시 제외)
  createdAt: string; // KST 'YYYY-MM-DD HH:mm:ss'
}

// 부모 프로필
export interface ParentProfile {
  id: string;
  userId: string;
  address: string;
  paymentMethod: string; // 프로토타입: 표시용 문자열 (예: '신한카드 ****1234')
  favorites?: string[]; // 즐겨찾기한 근무자 User.id 목록
  createdAt: string;
}

// 근무자가 제출하는 인증 서류 체크 상태
export interface WorkerDocs {
  license: boolean; // 면허증/자격증
  career: boolean; // 경력증명서
  idCard: boolean; // 신분증
  criminalCheck: boolean; // 범죄경력 조회 동의
  childAbuseCheck: boolean; // 아동학대 조회 동의
  healthCert: boolean; // 보건증
}

// 근무자 프로필
export interface WorkerProfile {
  id: string;
  userId: string;
  licenseType: LicenseType;
  grade: Grade; // 승인된(또는 신청) 등급
  careerYears: number;
  careerNote: string; // 경력 요약 (예: '신생아실 7년')
  docs: WorkerDocs;
  docFiles?: Record<string, string>; // 서류 종류 → 업로드된 파일 id
  status: WorkerStatus;
  rejectReason?: string;
  ratingAvg: number; // 평균 평점
  ratingCount: number; // 리뷰 수
  careCount: number; // 완료 돌봄 횟수
  createdAt: string;
}

// 예약
export interface Booking {
  id: string;
  parentId: string; // User.id (role=PARENT)
  workerId?: string | null; // User.id (role=WORKER), 매칭 후 채워짐 (거절 재매칭 대기 시 null)
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  hours: number;
  address: string;
  childAge: ChildAge;
  grade: Grade; // 희망 등급
  status: BookingStatus;
  workerAccepted?: boolean; // 근무자 수락 여부 (매칭 직후 false=대기, 수락 시 true)
  rejectedWorkerIds?: string[]; // 배정을 거절한 근무자 User.id (재매칭 시 제외)
  checkInAt?: string; // GPS 출근 시각 (KST)
  checkOutAt?: string; // GPS 퇴근 시각 (KST)
  createdAt: string;
}

// 결제/정산
export interface Payment {
  id: string;
  bookingId: string;
  hourly: number; // 등급 시급
  base: number; // 부모 결제액 (시급 × 시간)
  feeRate: number; // 수수료율
  feeAmount: number; // 플랫폼 수수료
  workerPayout: number; // 근무자 정산액 (base - feeAmount)
  status: PaymentStatus;
  paymentKey?: string; // 토스 결제키 (실결제 승인 시 저장, 환불에 사용)
  createdAt: string;
}

// 육아일지 기록 (근무자가 근무 중 작성)
export interface CareLogEntry {
  id: string;
  bookingId: string;
  workerId: string;
  type: string; // feeding, diaper, sleep, bath, play, meal, note ...
  note: string;
  createdAt: string; // KST
}

// 업로드 파일 (이미지 base64 data URL 저장)
export interface FileDoc {
  id: string;
  ownerId: string; // 업로드한 User.id
  kind: string; // 서류 종류 (license, idCard, ...)
  mimeType: string;
  dataUrl: string; // data:image/...;base64,....
  createdAt: string;
}

// 근무자 관찰 비고 (아이/부모 특징 — 관리자 분석·서비스 개선용 데이터)
export interface Observation {
  id: string;
  bookingId: string;
  workerId: string; // 작성한 근무자 User.id
  parentId: string; // 대상 부모 User.id
  childAge: ChildAge;
  tags: string[]; // 선택한 특징 태그 (낯가림 등)
  note: string; // 자유 비고
  createdAt: string; // KST
}

// 리뷰 (부모↔근무자 양방향)
export interface Review {
  id: string;
  bookingId: string;
  authorRole: Role; // 작성자 역할
  authorId: string; // User.id
  targetId: string; // 평가 대상 User.id
  rating: number; // 1~5
  tags: string[]; // 예: ['친절해요','전문성 최고']
  comment: string;
  createdAt: string;
}
