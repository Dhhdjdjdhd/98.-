import { Module } from '@nestjs/common';
import { StorageModule } from './common/storage/storage.module';
import { SeederService } from './common/seeder.service';
import { HealthController } from './common/health.controller';
import { PricingController } from './common/pricing.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { FilesModule } from './modules/files/files.module';
import { FavoritesModule } from './modules/favorites/favorites.module';

@Module({
  imports: [
    StorageModule, // 전역 저장소 (MongoDB 또는 로컬 JSON 자동 선택)
    AuthModule, // 전역 인증(JWT) + 가드
    UsersModule,
    AdminModule,
    BookingsModule,
    ReviewsModule,
    FilesModule, // 서류 파일 업로드
    FavoritesModule, // 부모 즐겨찾기
  ],
  controllers: [HealthController, PricingController], // 공개 헬스체크 · 등급 시급 조회
  providers: [SeederService], // 빈 DB 자동 시드
})
export class AppModule {}
