import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { JsonDbService } from '../../common/storage/json-db.service';
import { UsersService } from '../users/users.service';
import { COLLECTIONS, Role, BookingStatus } from '../../common/enums';
import { Booking, Review } from '../../common/models';
import { genId } from '../../common/util/id.util';
import { nowKst } from '../../common/util/kst.util';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly db: JsonDbService,
    private readonly users: UsersService,
  ) {}

  create(dto: CreateReviewDto) {
    const booking = this.db.findById<Booking>(COLLECTIONS.BOOKINGS, dto.bookingId);
    if (!booking) throw new NotFoundException('예약을 찾을 수 없습니다.');
    if (booking.status !== BookingStatus.DONE) {
      throw new BadRequestException('완료된 예약에만 리뷰를 작성할 수 있습니다.');
    }
    if (!booking.workerId) {
      throw new BadRequestException('매칭된 근무자가 없는 예약입니다.');
    }

    // 작성자/대상 결정: 부모가 쓰면 대상은 근무자, 근무자가 쓰면 대상은 부모
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
    this.db.insert(COLLECTIONS.REVIEWS, review);

    // 근무자 평점 반영 (부모가 작성한 경우)
    if (isParentAuthor) this.users.applyRating(targetId, dto.rating);

    return review;
  }

  listByTarget(targetId: string) {
    return this.db.find<Review>(COLLECTIONS.REVIEWS, (r) => r.targetId === targetId);
  }
}
