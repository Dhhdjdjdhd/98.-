// 데모 시드 데이터 생성 (로컬/배포 공용)
// force=false: users 컬렉션이 비었을 때만 채움(배포 최초 부팅 시 자동 시드)
// force=true : 기존 데이터 덮어씀(로컬 npm run seed)

import * as bcrypt from 'bcryptjs';
import { StorageService } from './storage/storage.interface';
import {
  COLLECTIONS,
  Role,
  Grade,
  LicenseType,
  WorkerStatus,
} from './enums';
import { User, ParentProfile, WorkerProfile, Review } from './models';
import { genId } from './util/id.util';
import { nowKst } from './util/kst.util';

// 데모 계정 공통 비밀번호
const DEMO_PW_HASH = bcrypt.hashSync('test1234', 10);

export async function seedDatabase(
  db: StorageService,
  opts: { force?: boolean } = {},
): Promise<boolean> {
  if (!opts.force) {
    const existing = await db.all(COLLECTIONS.USERS);
    if (existing.length > 0) return false; // 이미 데이터 있음 → 건너뜀
  }

  const now = nowKst();
  const users: User[] = [];
  const parents: ParentProfile[] = [];
  const workers: WorkerProfile[] = [];

  // 관리자
  users.push({
    id: 'usr_admin01',
    role: Role.ADMIN,
    phone: '010-0000-0000',
    name: '관리자',
    passwordHash: DEMO_PW_HASH,
    createdAt: now,
  });

  // 부모
  const parentUser: User = {
    id: 'usr_parent01',
    role: Role.PARENT,
    phone: '010-1111-1111',
    name: '지민맘',
    passwordHash: DEMO_PW_HASH,
    createdAt: now,
  };
  users.push(parentUser);
  parents.push({
    id: genId('par'),
    userId: parentUser.id,
    address: '서울시 강남구 테헤란로 123',
    paymentMethod: '신한카드 ****1234',
    createdAt: now,
  });

  const fullDocs = {
    license: true,
    career: true,
    idCard: true,
    healthCert: true,
  };

  // 등급별 2명(D는 1명) + 전문가별 샘플 리뷰
  const workerSeeds = [
    { name: '김서연', grade: Grade.A, license: LicenseType.NURSE, years: 7, note: '신생아실 7년', rating: 4.9, count: 328, reviews: [
      { rating: 5, tags: ['신생아 전문', '꼼꼼해요'], comment: '신생아 수유·목욕까지 안정적으로 봐주셨어요.' },
      { rating: 5, tags: ['친절해요'], comment: '밤중 케어도 완벽했고 설명이 자세했어요.' },
      { rating: 4, tags: ['시간 약속'], comment: '시간 약속을 잘 지키시고 깔끔하셨어요.' },
    ] },
    { name: '정민아', grade: Grade.A, license: LicenseType.NURSE, years: 9, note: '신생아 중환자실 9년', rating: 4.8, count: 402, reviews: [
      { rating: 5, tags: ['전문성 최고'], comment: '미숙아 케어 경험이 많아 정말 든든했습니다.' },
      { rating: 5, tags: ['아이가 잘 따랐어요'], comment: '아이가 낯을 안 가리고 편하게 잘 지냈어요.' },
    ] },
    { name: '이하나', grade: Grade.B, license: LicenseType.NURSE, years: 4, note: '내과 병동 4년', rating: 4.7, count: 152, reviews: [
      { rating: 5, tags: ['깔끔해요', '친절해요'], comment: '아이 컨디션을 세심하게 체크해 주셨어요.' },
      { rating: 4, tags: ['꼼꼼해요'], comment: '투약 시간 관리가 정확했습니다.' },
    ] },
    { name: '최유리', grade: Grade.B, license: LicenseType.NURSE, years: 6, note: '소아과 6년', rating: 4.9, count: 240, reviews: [
      { rating: 5, tags: ['전문성 최고', '아이가 잘 따랐어요'], comment: '아픈 아이를 잘 달래주셔서 감동했어요.' },
      { rating: 5, tags: ['친절해요'], comment: '소아과 경력이 느껴지는 케어였어요.' },
    ] },
    { name: '박지우', grade: Grade.C, license: LicenseType.ASSISTANT_NURSE, years: 5, note: '산후조리원 5년', rating: 4.8, count: 210, reviews: [
      { rating: 5, tags: ['깔끔해요'], comment: '산후조리 경험이 많아 신생아를 잘 다루셨어요.' },
      { rating: 4, tags: ['친절해요'], comment: '집안 정리까지 도와주셔서 감사했어요.' },
    ] },
    { name: '한소영', grade: Grade.C, license: LicenseType.ASSISTANT_NURSE, years: 3, note: '가정 산후관리 3년', rating: 4.6, count: 98, reviews: [
      { rating: 5, tags: ['아이가 잘 따랐어요'], comment: '아이랑 잘 놀아주셔서 좋았어요.' },
      { rating: 4, tags: ['시간 약속'], comment: '성실하고 밝은 분이세요.' },
    ] },
    { name: '오지훈', grade: Grade.D, license: LicenseType.ASSISTANT_NURSE, years: 2, note: '어린이집 보조 2년', rating: 4.5, count: 64, reviews: [
      { rating: 5, tags: ['친절해요'], comment: '활동적인 아이를 잘 봐주셨어요.' },
      { rating: 4, tags: ['꼼꼼해요'], comment: '놀이 활동을 다양하게 해주셨어요.' },
    ] },
  ];

  const reviews: Review[] = [];
  workerSeeds.forEach((w, i) => {
    const u: User = {
      id: `usr_worker0${i + 1}`,
      role: Role.WORKER,
      phone: `010-2222-000${i + 1}`,
      name: w.name,
      passwordHash: DEMO_PW_HASH,
      createdAt: now,
    };
    users.push(u);
    workers.push({
      id: genId('wrk'),
      userId: u.id,
      licenseType: w.license,
      grade: w.grade,
      careerYears: w.years,
      careerNote: w.note,
      docs: { ...fullDocs },
      status: WorkerStatus.APPROVED,
      ratingAvg: w.rating,
      ratingCount: w.reviews.length,
      careCount: w.count,
      createdAt: now,
    });
    w.reviews.forEach((r) => reviews.push({
      id: genId('rev'),
      bookingId: 'seed',
      authorRole: Role.PARENT,
      authorId: parentUser.id,
      targetId: u.id,
      rating: r.rating,
      tags: r.tags,
      comment: r.comment,
      createdAt: now,
    }));
  });

  await db.replaceAll(COLLECTIONS.USERS, users);
  await db.replaceAll(COLLECTIONS.PARENTS, parents);
  await db.replaceAll(COLLECTIONS.WORKERS, workers);
  await db.replaceAll(COLLECTIONS.BOOKINGS, []);
  await db.replaceAll(COLLECTIONS.PAYMENTS, []);
  await db.replaceAll(COLLECTIONS.REVIEWS, reviews);
  await db.replaceAll(COLLECTIONS.OBSERVATIONS, []);

  return true;
}
