// 전역 저장소 모듈: 어느 모듈에서든 JsonDbService 주입 가능
import { Global, Module } from '@nestjs/common';
import { JsonDbService } from './json-db.service';

@Global()
@Module({
  providers: [JsonDbService],
  exports: [JsonDbService],
})
export class JsonDbModule {}
