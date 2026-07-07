import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../../common/models';
import { RegisterParentDto } from '../users/dto/register-parent.dto';
import { RegisterWorkerDto } from '../users/dto/register-worker.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  // 가입 후 바로 로그인 상태(토큰 발급)
  async signupParent(dto: RegisterParentDto) {
    const created = await this.users.registerParent(dto);
    return this.issue(created);
  }

  async signupWorker(dto: RegisterWorkerDto) {
    const created = await this.users.registerWorker(dto);
    return this.issue(created);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByPhone(dto.phone);
    if (!user || !user.passwordHash || !bcrypt.compareSync(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('전화번호 또는 비밀번호가 올바르지 않습니다.');
    }
    return this.issue(user);
  }

  // JWT 발급 + 비밀번호 해시 제거한 사용자 정보 반환
  private issue(user: User & { profile?: any }) {
    const token = this.jwt.sign({ sub: user.id, role: user.role, name: user.name });
    const { passwordHash, ...safe } = user;
    return { token, user: safe };
  }
}
