import { Module } from '@nestjs/common';
import { JsonDbModule } from './common/storage/json-db.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [
    JsonDbModule, // 전역 로컬 JSON 저장소
    UsersModule,
    AdminModule,
    BookingsModule,
    ReviewsModule,
  ],
})
export class AppModule {}
