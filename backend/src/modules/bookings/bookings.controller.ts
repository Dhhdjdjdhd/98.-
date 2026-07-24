import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateBookingGroupDto } from './dto/create-booking-group.dto';
import { CreateCareLogDto } from './dto/create-care-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { Role } from '../../common/enums';

// 예약 API 전체 로그인 필수
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  // 예약 생성 (부모만) — parentId는 토큰에서 주입
  @Roles(Role.PARENT)
  @Post()
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: AuthUser) {
    return this.bookings.create({ ...dto, parentId: user.sub });
  }

  // 목록 (?parentId= / ?workerId=)
  @Get()
  list(
    @Query('parentId') parentId?: string,
    @Query('workerId') workerId?: string,
  ) {
    return this.bookings.list({ parentId, workerId });
  }

  // 부모 직접 선택용: 조건(등급·날짜·시간)에 배정 가능한 전문가 목록 (':id'보다 먼저)
  @Roles(Role.PARENT)
  @Get('available-workers')
  availableWorkers(
    @Query('grade') grade: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('hours') hours: string,
  ) {
    return this.bookings.findAvailableWorkers(grade, date, startTime, Number(hours));
  }

  // 여러 날짜 공통 가능 전문가 (dates=YYYY-MM-DD,YYYY-MM-DD)
  @Roles(Role.PARENT)
  @Get('available-workers-multi')
  availableWorkersMulti(
    @Query('grade') grade: string,
    @Query('dates') dates: string,
    @Query('startTime') startTime: string,
    @Query('hours') hours: string,
  ) {
    const list = (dates || '').split(',').filter(Boolean);
    return this.bookings.findAvailableWorkersMulti(grade, list, startTime, Number(hours));
  }

  // 여러 날짜 묶음 예약 생성 (부모만)
  @Roles(Role.PARENT)
  @Post('group')
  createGroup(@Body() dto: CreateBookingGroupDto, @CurrentUser() user: AuthUser) {
    return this.bookings.createGroup({ ...dto, parentId: user.sub });
  }

  // 묶음 결제 승인(총액 1건) (부모만)
  @Roles(Role.PARENT)
  @Post('group/:groupId/confirm-payment')
  confirmGroupPayment(
    @Param('groupId') groupId: string,
    @Body() body: { paymentKey: string; amount: number },
  ) {
    return this.bookings.confirmGroupPayment(groupId, body.paymentKey, body.amount);
  }

  // 묶음 취소·전액 환불 (부모 본인만)
  @Roles(Role.PARENT)
  @Post('group/:groupId/cancel')
  cancelGroup(@Param('groupId') groupId: string, @CurrentUser() user: AuthUser) {
    return this.bookings.cancelGroup(groupId, user.sub);
  }

  // 근무자 정산 요약 (':id'보다 먼저 선언해 경로 충돌 방지)
  @Get('worker/:workerId/settlement')
  settlement(@Param('workerId') workerId: string) {
    return this.bookings.settlement(workerId);
  }

  // 관리자: 전체 예약 현황
  @Roles(Role.ADMIN)
  @Get('all')
  allBookings() {
    return this.bookings.listAllForAdmin();
  }

  // 관리자 정산: 정산 대기 목록(완료+결제완료·미정산)
  @Roles(Role.ADMIN)
  @Get('settlements/pending')
  pendingSettlements() {
    return this.bookings.listPendingSettlements();
  }

  // 관리자 정산 승인 (근무자에게 입금 처리 = PAID → SETTLED)
  @Roles(Role.ADMIN)
  @Post(':id/settle')
  settle(@Param('id') id: string) {
    return this.bookings.settle(id);
  }

  // 육아일지 작성 (근무자) / 조회
  @Post(':id/care-log')
  addCareLog(
    @Param('id') id: string,
    @Body() dto: CreateCareLogDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.bookings.addCareLog(id, user.sub, dto);
  }

  @Get(':id/care-log')
  careLog(@Param('id') id: string) {
    return this.bookings.listCareLog(id);
  }

  // 근무자 관찰 비고 작성 (배정된 근무자만)
  @Roles(Role.WORKER)
  @Post(':id/observation')
  addObservation(
    @Param('id') id: string,
    @Body('note') note: string,
    @Body('tags') tags: string[],
    @CurrentUser() user: AuthUser,
  ) {
    return this.bookings.addObservation(id, user.sub, note, tags);
  }

  // 관찰 비고 조회 — 관리자 분석용 (?parentId= 로 부모별)
  @Roles(Role.ADMIN)
  @Get('observations/all')
  listObservations(@Query('parentId') parentId?: string) {
    return this.bookings.listObservations(parentId);
  }

  // 예약별 관찰 비고 — 배정된 근무자 본인의 작성 내역
  @Roles(Role.WORKER)
  @Get(':id/observations')
  bookingObservations(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bookings.listObservationsByBooking(id, user.sub);
  }

  // 관찰 비고 삭제 — 작성한 근무자 본인만
  @Roles(Role.WORKER)
  @Delete('observations/:obsId')
  deleteObservation(@Param('obsId') obsId: string, @CurrentUser() user: AuthUser) {
    return this.bookings.deleteObservation(obsId, user.sub);
  }

  // 예약자(부모) 연락처 — 배정된 근무자 본인만
  @Roles(Role.WORKER)
  @Get(':id/contact')
  parentContact(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bookings.parentContact(id, user.sub);
  }

  // 담당 근무자 정보 — 예약 부모 본인만
  @Roles(Role.PARENT)
  @Get(':id/worker')
  workerInfo(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bookings.workerInfo(id, user.sub);
  }

  // 결제 전 매칭 가능 여부(조건에 맞는 전문가 존재)
  @Get(':id/availability')
  availability(@Param('id') id: string) {
    return this.bookings.checkAvailability(id);
  }

  // 상세
  @Get(':id')
  detail(@Param('id') id: string) {
    return this.bookings.detail(id);
  }

  // 결제 → 자동 매칭 (프로토타입/데모용 즉시 결제)
  @Post(':id/pay')
  pay(@Param('id') id: string) {
    return this.bookings.pay(id);
  }

  // 실결제 승인(토스페이먼츠) → 자동 매칭 (부모만)
  @Roles(Role.PARENT)
  @Post(':id/confirm-payment')
  confirmPayment(
    @Param('id') id: string,
    @Body() body: { paymentKey: string; amount: number },
  ) {
    return this.bookings.confirmPayment(id, body.paymentKey, body.amount);
  }

  // 근무자 배정 수락 (근무자 본인만)
  @Roles(Role.WORKER)
  @Post(':id/accept')
  accept(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bookings.accept(id, user.sub);
  }

  // 근무자 배정 거절 → 재매칭 (근무자 본인만)
  @Roles(Role.WORKER)
  @Post(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bookings.reject(id, user.sub);
  }

  // 부모 재매칭 요청 → 현재 근무자 제외 재배정 (부모 본인만)
  @Roles(Role.PARENT)
  @Post(':id/rematch')
  rematch(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bookings.rematch(id, user.sub);
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

  // 취소(환불) — 부모 본인만
  @Roles(Role.PARENT)
  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bookings.cancel(id, user.sub);
  }
}
