import { Module } from '@nestjs/common';
import { StorageModule } from './common/storage/storage.module';
import { SeederService } from './common/seeder.service';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [
    StorageModule, // 전역 저장소 (MongoDB 또는 로컬 JSON 자동 선택)
    UsersModule,
    AdminModule,
    BookingsModule,
    ReviewsModule,
  ],
  providers: [SeederService], // 빈 DB 자동 시드
})
export class AppModule {}
