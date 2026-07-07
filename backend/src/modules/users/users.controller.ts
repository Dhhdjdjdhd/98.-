import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { WorkerStatus, Role } from '../../common/enums';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// 가입(POST)은 /auth/signup 으로 이동. 여기는 조회 전용.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // 근무자 목록 (관리자 전용, ?status=PENDING 등)
  @Roles(Role.ADMIN)
  @Get('workers')
  listWorkers(@Query('status') status?: WorkerStatus) {
    return this.users.listWorkers(status);
  }

  // 부모 상세 (로그인 필수)
  @Get('parents/:userId')
  getParent(@Param('userId') userId: string) {
    return this.users.getParentDetail(userId);
  }

  // 근무자 상세 (로그인 필수 — 매칭된 근무자 프로필 조회 등)
  @Get('workers/:userId')
  getWorker(@Param('userId') userId: string) {
    return this.users.getWorkerDetail(userId);
  }
}
