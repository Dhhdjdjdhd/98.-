// 공개 헬스체크 엔드포인트 (인증 없음) — Render 상태 확인용
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
