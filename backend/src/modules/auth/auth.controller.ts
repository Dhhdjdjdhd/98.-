import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterParentDto } from '../users/dto/register-parent.dto';
import { RegisterWorkerDto } from '../users/dto/register-worker.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, AuthUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // 부모 회원가입 (→ 토큰 발급)
  @Post('signup/parent')
  signupParent(@Body() dto: RegisterParentDto) {
    return this.auth.signupParent(dto);
  }

  // 근무자 회원가입 (승인 대기, → 토큰 발급)
  @Post('signup/worker')
  signupWorker(@Body() dto: RegisterWorkerDto) {
    return this.auth.signupWorker(dto);
  }

  // 로그인
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  // 내 정보 (토큰 유효성 확인용)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
