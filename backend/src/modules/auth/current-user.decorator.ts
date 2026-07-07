import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// JWT에서 추출한 사용자 정보: { sub, role, name }
export interface AuthUser {
  sub: string; // User.id
  role: string;
  name: string;
}

// 컨트롤러에서 @CurrentUser() 로 로그인 사용자 획득
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    return ctx.switchToHttp().getRequest().user;
  },
);
