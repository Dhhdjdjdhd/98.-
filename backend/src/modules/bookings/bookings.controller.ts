import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  // 예약 생성 (결제 대기)
  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookings.create(dto);
  }

  // 목록 (?parentId= / ?workerId=)
  @Get()
  list(
    @Query('parentId') parentId?: string,
    @Query('workerId') workerId?: string,
  ) {
    return this.bookings.list({ parentId, workerId });
  }

  // 근무자 정산 요약 (':id'보다 먼저 선언해 경로 충돌 방지)
  @Get('worker/:workerId/settlement')
  settlement(@Param('workerId') workerId: string) {
    return this.bookings.settlement(workerId);
  }

  // 상세
  @Get(':id')
  detail(@Param('id') id: string) {
    return this.bookings.detail(id);
  }

  // 결제 → 자동 매칭
  @Post(':id/pay')
  pay(@Param('id') id: string) {
    return this.bookings.pay(id);
  }

  // 근무 시작(GPS 출근)
  @Post(':id/check-in')
  checkIn(@Param('id') id: string) {
    return this.bookings.checkIn(id);
  }

  // 근무 완료(퇴근 + 정산)
  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.bookings.complete(id);
  }

  // 취소(환불)
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.bookings.cancel(id);
  }
}
