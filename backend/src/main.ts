import 'reflect-metadata';
import 'dotenv/config'; // 로컬 .env 로드 (배포는 플랫폼 환경변수 사용)
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  // 기본 body parser 끄고, 업로드(base64 이미지) 대비 크기 제한 상향
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: '8mb' }));
  app.use(urlencoded({ extended: true, limit: '8mb' }));

  // 프론트엔드(프로토타입)에서 호출할 수 있도록 CORS 허용
  app.enableCors();

  // 모든 API는 /api 프리픽스
  app.setGlobalPrefix('api');

  // DTO 검증: 정의되지 않은 필드 제거 + 타입 변환
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`맘케어 API 실행 중 → http://localhost:${port}/api`);
}
bootstrap();
