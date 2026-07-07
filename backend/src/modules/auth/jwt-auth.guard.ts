// JWT 검증 가드: Authorization: Bearer <token> 확인 후 req.user 주입
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const auth: string | undefined = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    const token = auth.slice(7);
    try {
      req.user = this.jwt.verify(token); // { sub, role, name }
      return true;
    } catch {
      throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
    }
  }
}
