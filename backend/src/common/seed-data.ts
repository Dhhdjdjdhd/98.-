// 데모 시드 데이터 생성 (로컬/배포 공용)
// force=false: users 컬렉션이 비었을 때만 채움(배포 최초 부팅 시 자동 시드)
// force=true : 기존 데이터 덮어씀(로컬 npm run seed)

import { StorageService } from './storage/storage.interface';
import {
  COLLECTIONS,
  Role,
  Grade,
  LicenseType,
  WorkerStatus,
} from './enums';
import { User, ParentProfile, WorkerProfile } from './models';
import { genId } from './util/id.util';
import { nowKst } from './util/kst.util';

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
    createdAt: now,
  });

  // 부모
  const parentUser: User = {
    id: 'usr_parent01',
    role: Role.PARENT,
    phone: '010-1111-1111',
    name: '지민맘',
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
    criminalCheck: true,
    childAbuseCheck: true,
    healthCert: true,
  };

  const workerSeeds = [
    { name: '김서연', grade: Grade.A, license: LicenseType.NURSE, years: 7, note: '신생아실 7년', rating: 4.9, count: 328 },
    { name: '이하나', grade: Grade.B, license: LicenseType.NURSE, years: 4, note: '내과 병동 4년', rating: 4.7, count: 152 },
    { name: '박지우', grade: Grade.C, license: LicenseType.ASSISTANT_NURSE, years: 5, note: '산후조리원 5년', rating: 4.8, count: 210 },
  ];

  workerSeeds.forEach((w, i) => {
    const u: User = {
      id: `usr_worker0${i + 1}`,
      role: Role.WORKER,
      phone: `010-2222-000${i + 1}`,
      name: w.name,
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
      ratingCount: 20,
      careCount: w.count,
      createdAt: now,
    });
  });

  await db.replaceAll(COLLECTIONS.USERS, users);
  await db.replaceAll(COLLECTIONS.PARENTS, parents);
  await db.replaceAll(COLLECTIONS.WORKERS, workers);
  await db.replaceAll(COLLECTIONS.BOOKINGS, []);
  await db.replaceAll(COLLECTIONS.PAYMENTS, []);
  await db.replaceAll(COLLECTIONS.REVIEWS, []);

  return true;
}
