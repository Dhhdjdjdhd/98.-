import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

// 업로드/조회 모두 로그인 필수
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  // 파일 업로드 (본인 토큰 기준 owner)
  @Post()
  upload(@Body() dto: UploadFileDto, @CurrentUser() user: AuthUser) {
    return this.files.upload(user.sub, user.role, dto);
  }

  // 파일 조회 (관리자 검수 시 이미지 열람)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.files.get(id);
  }
}
