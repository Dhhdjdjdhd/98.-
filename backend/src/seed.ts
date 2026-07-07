// 초기 시드 데이터 생성 스크립트 (기존 데이터 덮어씀)
// 실행: npm run seed
// - 로컬(JSON) / 배포(MongoDB) 모두 동일하게 동작 (MONGODB_URI 유무로 자동 선택)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StorageService } from './common/storage/storage.interface';
import { seedDatabase } from './common/seed-data';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(StorageService);

  await seedDatabase(db, { force: true });

  console.log('✅ 시드 완료');
  console.log('   - 관리자 usr_admin01');
  console.log('   - 부모   usr_parent01 (지민맘)');
  console.log('   - 근무자 usr_worker01(A/김서연), usr_worker02(B/이하나), usr_worker03(C/박지우)');

  await app.close();
}

run();
