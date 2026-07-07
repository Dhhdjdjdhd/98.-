import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterParentDto } from './dto/register-parent.dto';
import { RegisterWorkerDto } from './dto/register-worker.dto';
import { WorkerStatus } from '../../common/enums';

@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // 부모 가입
  @Post('parents')
  registerParent(@Body() dto: RegisterParentDto) {
    return this.users.registerParent(dto);
  }

  // 근무자 가입 (승인 대기)
  @Post('workers')
  registerWorker(@Body() dto: RegisterWorkerDto) {
    return this.users.registerWorker(dto);
  }

  // 근무자 목록 (?status=PENDING 등)
  @Get('workers')
  listWorkers(@Query('status') status?: WorkerStatus) {
    return this.users.listWorkers(status);
  }

  // 부모 상세
  @Get('parents/:userId')
  getParent(@Param('userId') userId: string) {
    return this.users.getParentDetail(userId);
  }

  // 근무자 상세
  @Get('workers/:userId')
  getWorker(@Param('userId') userId: string) {
    return this.users.getWorkerDetail(userId);
  }
}
