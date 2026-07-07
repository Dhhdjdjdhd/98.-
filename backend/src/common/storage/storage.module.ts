// 전역 저장소 모듈
// MONGODB_URI 존재 여부로 구현체 선택: 있으면 MongoDB, 없으면 로컬 JSON
import { Global, Module, Logger } from '@nestjs/common';
import { StorageService } from './storage.interface';
import { JsonDbService } from './json-db.service';
import { MongoDbService } from './mongo-db.service';

const useMongo = !!process.env.MONGODB_URI;
new Logger('Storage').log(
  useMongo ? 'MongoDB 저장소 사용' : '로컬 JSON 저장소 사용',
);

@Global()
@Module({
  providers: [
    {
      provide: StorageService,
      useClass: useMongo ? MongoDbService : JsonDbService,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
