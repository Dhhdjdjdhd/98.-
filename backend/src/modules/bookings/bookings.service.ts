import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JsonDbService } from '../../common/storage/json-db.service';
import { UsersService } from '../users/users.service';
import {
  COLLECTIONS,
  BookingStatus,
  PaymentStatus,
  Role,
} from '../../common/enums';
import { Booking, Payment } from '../../common/models';
import { genId } from '../../common/util/id.util';
import { nowKst } from '../../common/util/kst.util';
import { priceBooking } from '../../common/pricing';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: JsonDbService,
    private readonly users: UsersService,
  ) {}

  private getBooking(id: string): Booking {
    const booking = this.db.findById<Booking>(COLLECTIONS.BOOKINGS, id);
    if (!booking) throw new NotFoundException('예약을 찾을 수 없습니다.');
    return booking;
  }

  private getPaymentByBooking(bookingId: string): Payment {
    const payment = this.db.findOne<Payment>(
      COLLECTIONS.PAYMENTS,
      (p) => p.bookingId === bookingId,
    );
    if (!payment) throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    return payment;
  }

  // ---- 1. 예약 생성 (결제 대기) ----
  create(dto: CreateBookingDto) {
    const parent = this.users.getUser(dto.parentId);
    if (parent.role !== Role.PARENT) {
      throw new BadRequestException('부모 계정만 예약할 수 있습니다.');
    }

    const now = nowKst();
    const booking: Booking = {
      id: genId('bk'),
      parentId: dto.parentId,
      date: dto.date,
      startTime: dto.startTime,
      hours: dto.hours,
      address: dto.address,
      childAge: dto.childAge,
      grade: dto.grade,
      status: BookingStatus.REQUESTED,
      createdAt: now,
    };
    this.db.insert(COLLECTIONS.BOOKINGS, booking);

    // 결제 내역 생성 (PENDING)
    const price = priceBooking(dto.grade, dto.hours);
    const payment: Payment = {
      id: genId('pay'),
      bookingId: booking.id,
      hourly: price.hourly,
      base: price.base,
      feeRate: price.feeRate,
      feeAmount: price.feeAmount,
      workerPayout: price.workerPayout,
      status: PaymentStatus.PENDING,
      createdAt: now,
    };
    this.db.insert(COLLECTIONS.PAYMENTS, payment);

    return { booking, payment };
  }

  // ---- 2. 결제 완료 → 자동 매칭 ----
  pay(bookingId: string) {
    const booking = this.getBooking(bookingId);
    if (booking.status !== BookingStatus.REQUESTED) {
      throw new BadRequestException('결제 가능한 상태가 아닙니다.');
    }
    const payment = this.getPaymentByBooking(bookingId);
    this.db.update<Payment>(COLLECTIONS.PAYMENTS, payment.id, {
      status: PaymentStatus.PAID,
    });

    // 자동 매칭 시도
    const matched = this.autoMatch(booking);
    return matched;
  }

  // ---- 자동 매칭: 희망 등급의 승인된 근무자 중 첫 번째 배정 ----
  private autoMatch(booking: Booking) {
    const candidates = this.users.findApprovedWorkersByGrade(booking.grade);
    if (candidates.length === 0) {
      // 매칭 실패: 결제는 유지, 관리자 수동 매칭 대기
      return {
        booking: this.getBooking(booking.id),
        matched: false,
        message: '현재 매칭 가능한 근무자가 없습니다. 관리자 수동 매칭 대기 중입니다.',
      };
    }
    // 프로토타입: 평점 높은 순 우선
    candidates.sort((a, b) => b.ratingAvg - a.ratingAvg);
    const worker = candidates[0];

    const updated = this.db.update<Booking>(COLLECTIONS.BOOKINGS, booking.id, {
      workerId: worker.userId,
      status: BookingStatus.MATCHED,
    });
    return { booking: updated, matched: true, workerId: worker.userId };
  }

  // ---- 3. 근무 시작 (GPS 출근 체크) ----
  checkIn(bookingId: string) {
    const booking = this.getBooking(bookingId);
    if (booking.status !== BookingStatus.MATCHED) {
      throw new BadRequestException('매칭 완료 상태에서만 근무를 시작할 수 있습니다.');
    }
    return this.db.update<Booking>(COLLECTIONS.BOOKINGS, bookingId, {
      status: BookingStatus.IN_PROGRESS,
      checkInAt: nowKst(),
    });
  }

  // ---- 4. 근무 완료 (퇴근 + 정산) ----
  complete(bookingId: string) {
    const booking = this.getBooking(bookingId);
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('근무 중 상태에서만 완료할 수 있습니다.');
    }
    const updated = this.db.update<Booking>(COLLECTIONS.BOOKINGS, bookingId, {
      status: BookingStatus.DONE,
      checkOutAt: nowKst(),
    });

    // 결제 → 정산 완료
    const payment = this.getPaymentByBooking(bookingId);
    this.db.update<Payment>(COLLECTIONS.PAYMENTS, payment.id, {
      status: PaymentStatus.SETTLED,
    });

    // 근무자 완료 횟수 증가
    if (booking.workerId) this.users.incrementCareCount(booking.workerId);

    return updated;
  }

  // ---- 5. 취소 (환불) ----
  cancel(bookingId: string) {
    const booking = this.getBooking(bookingId);
    if ([BookingStatus.DONE, BookingStatus.CANCELED].includes(booking.status)) {
      throw new BadRequestException('이미 종료된 예약입니다.');
    }
    const updated = this.db.update<Booking>(COLLECTIONS.BOOKINGS, bookingId, {
      status: BookingStatus.CANCELED,
    });
    const payment = this.db.findOne<Payment>(
      COLLECTIONS.PAYMENTS,
      (p) => p.bookingId === bookingId,
    );
    if (payment && payment.status === PaymentStatus.PAID) {
      this.db.update<Payment>(COLLECTIONS.PAYMENTS, payment.id, {
        status: PaymentStatus.REFUNDED,
      });
    }
    return updated;
  }

  // ---- 조회 ----
  detail(bookingId: string) {
    const booking = this.getBooking(bookingId);
    const payment = this.db.findOne<Payment>(
      COLLECTIONS.PAYMENTS,
      (p) => p.bookingId === bookingId,
    );
    return { ...booking, payment };
  }

  list(filter: { parentId?: string; workerId?: string }) {
    let bookings = this.db.all<Booking>(COLLECTIONS.BOOKINGS);
    if (filter.parentId) bookings = bookings.filter((b) => b.parentId === filter.parentId);
    if (filter.workerId) bookings = bookings.filter((b) => b.workerId === filter.workerId);
    return bookings;
  }

  // ---- 근무자 정산 요약 ----
  settlement(workerUserId: string) {
    const done = this.db.find<Booking>(
      COLLECTIONS.BOOKINGS,
      (b) => b.workerId === workerUserId && b.status === BookingStatus.DONE,
    );
    const payments = this.db.all<Payment>(COLLECTIONS.PAYMENTS);
    const bookingIds = new Set(done.map((b) => b.id));
    const settled = payments.filter(
      (p) => bookingIds.has(p.bookingId) && p.status === PaymentStatus.SETTLED,
    );
    const totalPayout = settled.reduce((sum, p) => sum + p.workerPayout, 0);
    return {
      workerUserId,
      completedCount: done.length,
      totalPayout,
    };
  }
}
