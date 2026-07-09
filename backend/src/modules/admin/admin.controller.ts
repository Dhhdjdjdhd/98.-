import { Controller, Post, Get, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ReviewDocsDto, RejectDto } from './dto/review-docs.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../common/enums';

// 관리자 전용: 로그인 + ADMIN 역할 필수
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('summary')
  summary() {
    return this.admin.summary();
  }

  // 서류 검수 결과 반영
  @Patch('workers/:userId/docs')
  reviewDocs(@Param('userId') userId: string, @Body() dto: ReviewDocsDto) {
    const { grade, ...docs } = dto;
    return this.admin.reviewDocs(userId, docs, grade);
  }

  // 근무자 프로필 수정 (이름·자격·경력·등급·서류파일)
  @Patch('workers/:userId/profile')
  updateProfile(@Param('userId') userId: string, @Body() dto: any) {
    return this.admin.updateWorkerProfile(userId, dto);
  }

  // 승인
  @Post('workers/:userId/approve')
  approve(@Param('userId') userId: string) {
    return this.admin.approve(userId);
  }

  // 반려
  @Post('workers/:userId/reject')
  reject(@Param('userId') userId: string, @Body() dto: RejectDto) {
    return this.admin.reject(userId, dto.reason ?? '사유 미기재');
  }
}
