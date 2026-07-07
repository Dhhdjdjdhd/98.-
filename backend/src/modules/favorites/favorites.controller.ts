import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { Role } from '../../common/enums';

// 즐겨찾기는 부모 전용
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.favorites.list(user.sub);
  }

  @Post(':workerId')
  add(@Param('workerId') workerId: string, @CurrentUser() user: AuthUser) {
    return this.favorites.add(user.sub, workerId);
  }

  @Delete(':workerId')
  remove(@Param('workerId') workerId: string, @CurrentUser() user: AuthUser) {
    return this.favorites.remove(user.sub, workerId);
  }
}
