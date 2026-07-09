import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StorageService } from '../../common/storage/storage.interface';
import { UsersService } from '../users/users.service';
import {
  COLLECTIONS,
  BookingStatus,
  PaymentStatus,
  Role,
} from '../../common/enums';
import { Booking, Payment, CareLogEntry, Observation } from '../../common/models';
import { genId } from '../../common/util/id.util';
import { nowKst } from '../../common/util/kst.util';
import { priceBooking } from '../../common/pricing';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateCareLogDto } from './dto/create-care-log.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: StorageService,
    private readonly users: UsersService,
  ) {}

  private async getBooking(id: string): Promise<Booking> {
    const booking = await this.db.findById<Booking>(COLLECTIONS.BOOKINGS, id);
    if (!booking) throw new NotFoundException('예약을 찾을 수 없습니다.');
    return booking;
  }

  private async getPaymentByBooking(bookingId: string): Promise<Payment> {
    const payment = await this.db.findOne<Payment>(
      COLLECTIONS.PAYMENTS,
      (p) => p.bookingId === bookingId,
    );
    if (!payment) throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    return payment;
  }

  // ---- 1. 예약 생성 (결제 대기) ----
  async create(dto: CreateBookingDto) {
    const parentId = dto.parentId;
    if (!parentId) throw new BadRequestException('로그인이 필요합니다.');
    const parent = await this.users.getUser(parentId);
    if (parent.role !== Role.PARENT) {
      throw new BadRequestException('부모 계정만 예약할 수 있습니다.');
    }

    const now = nowKst();
    const booking: Booking = {
      id: genId('bk'),
      parentId: parentId,
      date: dto.date,
      startTime: dto.startTime,
      hours: dto.hours,
      address: dto.address,
      childAge: dto.childAge,
      grade: dto.grade,
      status: BookingStatus.REQUESTED,
      createdAt: now,
    };
    await this.db.insert(COLLECTIONS.BOOKINGS, booking);

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
    await this.db.insert(COLLECTIONS.PAYMENTS, payment);

    return { booking, payment };
  }

  // ---- 2. 결제 완료 → 자동 매칭 ----
  async pay(bookingId: string) {
    const booking = await this.getBooking(bookingId);
    if (booking.status !== BookingStatus.REQUESTED) {
      throw new BadRequestException('결제 가능한 상태가 아닙니다.');
    }
    const payment = await this.getPaymentByBooking(bookingId);
    await this.db.update<Payment>(COLLECTIONS.PAYMENTS, payment.id, {
      status: PaymentStatus.PAID,
    });

    return this.autoMatch(booking);
  }

  // 'HH:mm' → 분 단위 정수
  private timeToMin(t: string): number {
    const [h, m] = (t || '0:0').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  // 두 예약의 근무 시간대가 겹치는지 (같은 날짜 + 구간 교차)
  private overlaps(a: Booking, b: Booking): boolean {
    if (a.date !== b.date) return false;
    const aStart = this.timeToMin(a.startTime);
    const aEnd = aStart + a.hours * 60;
    const bStart = this.timeToMin(b.startTime);
    const bEnd = bStart + b.hours * 60;
    return aStart < bEnd && bStart < aEnd; // 경계 접촉(끝=시작)은 겹침 아님
  }

  // 배정 후보: 희망 등급의 승인 근무자 중 거절자·같은날 시간중복 제외
  private async findCandidates(booking: Booking, rejected: Set<string>) {
    const activeSameDay = await this.db.find<Booking>(
      COLLECTIONS.BOOKINGS,
      (b) =>
        b.id !== booking.id &&
        b.date === booking.date &&
        !!b.workerId &&
        (b.status === BookingStatus.MATCHED || b.status === BookingStatus.IN_PROGRESS),
    );
    const busy = new Set(
      activeSameDay.filter((b) => this.overlaps(b, booking)).map((b) => b.workerId as string),
    );
    return (await this.users.findApprovedWorkersByGrade(booking.grade)).filter(
      (w) => !rejected.has(w.userId) && !busy.has(w.userId),
    );
  }

  // ---- 자동 매칭: 후보 중 평점순 배정, 없으면 매칭 대기 ----
  private async autoMatch(booking: Booking) {
    const rejected = new Set(booking.rejectedWorkerIds ?? []);
    const candidates = await this.findCandidates(booking, rejected);

    if (candidates.length === 0) {
      // 배정 가능한 근무자가 없으면 매칭 대기 상태로 되돌린다.
      const updated = await this.db.update<Booking>(COLLECTIONS.BOOKINGS, booking.id, {
        workerId: null,
        status: BookingStatus.REQUESTED,
        workerAccepted: false,
      });
      return {
        booking: updated,
        matched: false,
        message: '현재 매칭 가능한 근무자가 없습니다. 관리자 수동 매칭 대기 중입니다.',
      };
    }
    candidates.sort((a, b) => b.ratingAvg - a.ratingAvg);
    const worker = candidates[0];

    // 근무자 수락 대기 상태로 배정 (workerAccepted=false)
    const updated = await this.db.update<Booking>(COLLECTIONS.BOOKINGS, booking.id, {
      workerId: worker.userId,
      status: BookingStatus.MATCHED,
      workerAccepted: false,
    });
    return { booking: updated, matched: true, workerId: worker.userId };
  }

  // ---- 3-a. 근무자 배정 수락 ----
  async accept(bookingId: string, workerId: string) {
    const booking = await this.getBooking(bookingId);
    if (booking.status !== BookingStatus.MATCHED || booking.workerId !== workerId) {
      throw new BadRequestException('수락할 수 있는 배정이 아닙니다.');
    }
    if (booking.workerAccepted) {
      throw new BadRequestException('이미 수락한 근무입니다.');
    }
    return this.db.update<Booking>(COLLECTIONS.BOOKINGS, bookingId, {
      workerAccepted: true,
    });
  }

  // ---- 3-b. 근무자 배정 거절 → 거절자 제외하고 재매칭 ----
  async reject(bookingId: string, workerId: string) {
    const booking = await this.getBooking(bookingId);
    if (booking.status !== BookingStatus.MATCHED || booking.workerId !== workerId) {
      throw new BadRequestException('거절할 수 있는 배정이 아닙니다.');
    }
    const rejectedWorkerIds = [...(booking.rejectedWorkerIds ?? []), workerId];
    await this.db.update<Booking>(COLLECTIONS.BOOKINGS, bookingId, { rejectedWorkerIds });
    const fresh = await this.getBooking(bookingId);
    return this.autoMatch(fresh);
  }

  // ---- 3-c. 부모 재매칭 요청 → 현재 근무자 제외하고 다시 배정 ----
  async rematch(bookingId: string, parentId: string) {
    const booking = await this.getBooking(bookingId);
    if (booking.parentId !== parentId) {
      throw new BadRequestException('본인 예약만 변경할 수 있습니다.');
    }
    if (booking.status !== BookingStatus.MATCHED) {
      throw new BadRequestException('매칭 완료 상태에서만 전문가를 변경할 수 있습니다.');
    }
    if (!booking.workerId) {
      throw new BadRequestException('배정된 전문가가 없습니다.');
    }
    // 대체 후보를 먼저 확인 — 없으면 현재 전문가를 그대로 유지(변경하지 않음)
    const rejected = new Set([...(booking.rejectedWorkerIds ?? []), booking.workerId]);
    const candidates = await this.findCandidates(booking, rejected);
    if (candidates.length === 0) {
      return {
        booking,
        matched: false,
        kept: true,
        message: '현재 배정 가능한 다른 전문가가 없습니다. 지금 전문가를 유지합니다.',
      };
    }
    // 후보 있음 → 현재 전문가 제외하고 재배정
    await this.db.update<Booking>(COLLECTIONS.BOOKINGS, bookingId, {
      rejectedWorkerIds: [...rejected],
    });
    const fresh = await this.getBooking(bookingId);
    return this.autoMatch(fresh);
  }

  // ---- 3. 근무 시작 (GPS 출근) ----
  async checkIn(bookingId: string) {
    const booking = await this.getBooking(bookingId);
    if (booking.status !== BookingStatus.MATCHED) {
      throw new BadRequestException('매칭 완료 상태에서만 근무를 시작할 수 있습니다.');
    }
    if (!booking.workerAccepted) {
      throw new BadRequestException('예약을 먼저 수락해야 근무를 시작할 수 있습니다.');
    }
    return this.db.update<Booking>(COLLECTIONS.BOOKINGS, bookingId, {
      status: BookingStatus.IN_PROGRESS,
      checkInAt: nowKst(),
    });
  }

  // ---- 4. 근무 완료 (퇴근 + 정산) ----
  async complete(bookingId: string) {
    const booking = await this.getBooking(bookingId);
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('근무 중 상태에서만 완료할 수 있습니다.');
    }
    const updated = await this.db.update<Booking>(COLLECTIONS.BOOKINGS, bookingId, {
      status: BookingStatus.DONE,
      checkOutAt: nowKst(),
    });

    const payment = await this.getPaymentByBooking(bookingId);
    await this.db.update<Payment>(COLLECTIONS.PAYMENTS, payment.id, {
      status: PaymentStatus.SETTLED,
    });

    if (booking.workerId) await this.users.incrementCareCount(booking.workerId);

    return updated;
  }

  // ---- 5. 취소 (환불) ----
  async cancel(bookingId: string, requesterId?: string) {
    const booking = await this.getBooking(bookingId);
    if (requesterId && booking.parentId !== requesterId) {
      throw new BadRequestException('본인 예약만 취소할 수 있습니다.');
    }
    if (
      [BookingStatus.IN_PROGRESS, BookingStatus.DONE, BookingStatus.CANCELED].includes(booking.status)
    ) {
      throw new BadRequestException('근무가 시작되었거나 종료된 예약은 취소할 수 없습니다.');
    }
    const updated = await this.db.update<Booking>(COLLECTIONS.BOOKINGS, bookingId, {
      status: BookingStatus.CANCELED,
    });
    const payment = await this.db.findOne<Payment>(
      COLLECTIONS.PAYMENTS,
      (p) => p.bookingId === bookingId,
    );
    if (payment && payment.status === PaymentStatus.PAID) {
      await this.db.update<Payment>(COLLECTIONS.PAYMENTS, payment.id, {
        status: PaymentStatus.REFUNDED,
      });
    }
    return updated;
  }

  // ---- 예약자(부모) 연락처 — 배정된 근무자 본인만 ----
  async parentContact(bookingId: string, workerId: string) {
    const booking = await this.getBooking(bookingId);
    if (booking.workerId !== workerId) {
      throw new BadRequestException('배정된 근무자만 예약자 연락처를 볼 수 있습니다.');
    }
    const parent = await this.users.getUser(booking.parentId);
    return { name: parent.name, phone: parent.phone };
  }

  // ---- 담당 근무자 정보(프로필+연락처) — 예약 부모 본인만 ----
  async workerInfo(bookingId: string, parentId: string) {
    const booking = await this.getBooking(bookingId);
    if (booking.parentId !== parentId) {
      throw new BadRequestException('본인 예약의 담당자만 조회할 수 있습니다.');
    }
    if (!booking.workerId) return null; // 아직 배정 전
    const user = await this.users.getUser(booking.workerId);
    const profile = await this.users.getWorkerByUserId(booking.workerId);
    return {
      workerId: booking.workerId,
      name: user.name,
      phone: user.phone,
      licenseType: profile.licenseType,
      grade: profile.grade,
      ratingAvg: profile.ratingAvg,
      careerNote: profile.careerNote,
      careerYears: profile.careerYears,
      careCount: profile.careCount,
      docs: profile.docs,
    };
  }

  // ---- 조회 ----
  async detail(bookingId: string) {
    const booking = await this.getBooking(bookingId);
    const payment = await this.db.findOne<Payment>(
      COLLECTIONS.PAYMENTS,
      (p) => p.bookingId === bookingId,
    );
    return { ...booking, payment };
  }

  async list(filter: { parentId?: string; workerId?: string }) {
    let bookings = await this.db.all<Booking>(COLLECTIONS.BOOKINGS);
    if (filter.parentId) bookings = bookings.filter((b) => b.parentId === filter.parentId);
    if (filter.workerId) bookings = bookings.filter((b) => b.workerId === filter.workerId);
    return bookings;
  }

  // ---- 육아일지 ----
  async addCareLog(bookingId: string, workerId: string, dto: CreateCareLogDto) {
    await this.getBooking(bookingId); // 존재 확인
    const entry: CareLogEntry = {
      id: genId('log'),
      bookingId,
      workerId,
      type: dto.type,
      note: dto.note ?? '',
      createdAt: nowKst(),
    };
    await this.db.insert(COLLECTIONS.CARE_LOGS, entry);
    return entry;
  }

  // ---- 근무자 관찰 비고 (아이/부모 특징 — 관리자 분석용) ----
  async addObservation(bookingId: string, workerId: string, note: string, tags: string[] = []) {
    const booking = await this.getBooking(bookingId);
    if (booking.workerId !== workerId) {
      throw new BadRequestException('배정된 근무자만 비고를 작성할 수 있습니다.');
    }
    const text = (note ?? '').trim();
    const cleanTags = Array.isArray(tags) ? tags.filter(Boolean) : [];
    if (!text && cleanTags.length === 0) {
      throw new BadRequestException('특징을 선택하거나 비고를 입력하세요.');
    }
    const observation: Observation = {
      id: genId('obs'),
      bookingId,
      workerId,
      parentId: booking.parentId,
      childAge: booking.childAge,
      tags: cleanTags,
      note: text,
      createdAt: nowKst(),
    };
    await this.db.insert(COLLECTIONS.OBSERVATIONS, observation);
    return observation;
  }

  // 관리자 분석용: 부모별(또는 전체) 관찰 비고 목록
  async listObservations(parentId?: string) {
    const list = parentId
      ? await this.db.find<Observation>(COLLECTIONS.OBSERVATIONS, (o) => o.parentId === parentId)
      : await this.db.all<Observation>(COLLECTIONS.OBSERVATIONS);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  // 관찰 비고 삭제 (작성한 근무자 본인만)
  async deleteObservation(obsId: string, workerId: string) {
    const obs = await this.db.findById<Observation>(COLLECTIONS.OBSERVATIONS, obsId);
    if (!obs) throw new NotFoundException('비고를 찾을 수 없습니다.');
    if (obs.workerId !== workerId) {
      throw new BadRequestException('작성한 근무자만 삭제할 수 있습니다.');
    }
    await this.db.remove(COLLECTIONS.OBSERVATIONS, obsId);
    return { deleted: true };
  }

  // 예약별 관찰 비고 (배정된 근무자 본인이 작성 내역 확인)
  async listObservationsByBooking(bookingId: string, workerId: string) {
    const booking = await this.getBooking(bookingId);
    if (booking.workerId !== workerId) {
      throw new BadRequestException('배정된 근무자만 조회할 수 있습니다.');
    }
    const list = await this.db.find<Observation>(
      COLLECTIONS.OBSERVATIONS,
      (o) => o.bookingId === bookingId,
    );
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listCareLog(bookingId: string) {
    const logs = await this.db.find<CareLogEntry>(
      COLLECTIONS.CARE_LOGS,
      (l) => l.bookingId === bookingId,
    );
    return logs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  // ---- 근무자 정산 요약 ----
  async settlement(workerUserId: string) {
    const done = await this.db.find<Booking>(
      COLLECTIONS.BOOKINGS,
      (b) => b.workerId === workerUserId && b.status === BookingStatus.DONE,
    );
    const payments = await this.db.all<Payment>(COLLECTIONS.PAYMENTS);
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
