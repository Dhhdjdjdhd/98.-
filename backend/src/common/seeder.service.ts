// 배포 최초 부팅 시 DB가 비어 있으면 데모 데이터를 자동 시드
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { StorageService } from './storage/storage.interface';
import { seedDatabase } from './seed-data';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Seeder');
  constructor(private readonly db: StorageService) {}

  async onApplicationBootstrap(): Promise<void> {
    // AUTO_SEED=false 로 끌 수 있음(기본 켜짐)
    if (process.env.AUTO_SEED === 'false') return;
    const seeded = await seedDatabase(this.db, { force: false });
    if (seeded) this.logger.log('빈 DB 감지 → 데모 데이터 자동 시드 완료');
  }
}
