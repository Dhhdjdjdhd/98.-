import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StorageService } from '../../common/storage/storage.interface';
import { UsersService } from '../users/users.service';
import { COLLECTIONS, Role, BookingStatus } from '../../common/enums';
import { Booking, Review } from '../../common/models';
import { genId } from '../../common/util/id.util';
import { nowKst } from '../../common/util/kst.util';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly db: StorageService,
    private readonly users: UsersService,
  ) {}

  async create(dto: CreateReviewDto) {
    const booking = await this.db.findById<Booking>(COLLECTIONS.BOOKINGS, dto.bookingId);
    if (!booking) throw new NotFoundException('예약을 찾을 수 없습니다.');
    if (booking.status !== BookingStatus.DONE) {
      throw new BadRequestException('완료된 예약에만 리뷰를 작성할 수 있습니다.');
    }
    if (!booking.workerId) {
      throw new BadRequestException('매칭된 근무자가 없는 예약입니다.');
    }

    // 부모가 쓰면 대상은 근무자, 근무자가 쓰면 대상은 부모
    const isParentAuthor = dto.authorRole === Role.PARENT;
    const authorId = isParentAuthor ? booking.parentId : booking.workerId;
    const targetId = isParentAuthor ? booking.workerId : booking.parentId;

    const review: Review = {
      id: genId('rev'),
      bookingId: dto.bookingId,
      authorRole: dto.authorRole,
      authorId,
      targetId,
      rating: dto.rating,
      tags: dto.tags ?? [],
      comment: dto.comment ?? '',
      createdAt: nowKst(),
    };
    await this.db.insert(COLLECTIONS.REVIEWS, review);

    if (isParentAuthor) await this.users.applyRating(targetId, dto.rating);

    return review;
  }

  async listByTarget(targetId: string) {
    return this.db.find<Review>(COLLECTIONS.REVIEWS, (r) => r.targetId === targetId);
  }
}
