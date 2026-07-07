import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums';

export const ROLES_KEY = 'roles';
// @Roles(Role.ADMIN) 형태로 라우트/컨트롤러에 필요한 역할 지정
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
