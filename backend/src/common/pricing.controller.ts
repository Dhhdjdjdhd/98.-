// 공개 등급 시급 조회 (인증 없음) — 부모 앱/랜딩의 요금 표시용
import { Controller, Get } from '@nestjs/common';
import { StorageService } from './storage/storage.interface';
import { readGradeHourly } from './pricing';

@Controller('grade-pricing')
export class PricingController {
  constructor(private readonly db: StorageService) {}

  @Get()
  get() {
    return readGradeHourly(this.db);
  }
}
