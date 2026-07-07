// 초기 시드 데이터 생성 스크립트
// 실행: npm run seed
// - 관리자 1, 부모 1, 승인된 근무자 3(A/B/C 등급) 생성
// - 기존 데이터는 덮어씀(replaceAll)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsonDbService } from './common/storage/json-db.service';
import {
  COLLECTIONS,
  Role,
  Grade,
  LicenseType,
  WorkerStatus,
} from './common/enums';
import { User, ParentProfile, WorkerProfile } from './common/models';
import { genId } from './common/util/id.util';
import { nowKst } from './common/util/kst.util';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(JsonDbService);
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

  // 승인된 근무자 3명 (A/B/C)
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

  db.replaceAll(COLLECTIONS.USERS, users);
  db.replaceAll(COLLECTIONS.PARENTS, parents);
  db.replaceAll(COLLECTIONS.WORKERS, workers);
  db.replaceAll(COLLECTIONS.BOOKINGS, []);
  db.replaceAll(COLLECTIONS.PAYMENTS, []);
  db.replaceAll(COLLECTIONS.REVIEWS, []);

  console.log('✅ 시드 완료');
  console.log(`   - 관리자 usr_admin01`);
  console.log(`   - 부모   usr_parent01 (지민맘)`);
  console.log(`   - 근무자 usr_worker01(A/김서연), usr_worker02(B/이하나), usr_worker03(C/박지우)`);

  await app.close();
}

seed();
