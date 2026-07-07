import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ReviewDocsDto, RejectDto } from './dto/review-docs.dto';

// 프로토타입 단계: 인증/권한 가드는 생략(추후 AdminGuard 추가 예정)
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
