import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  Matches,
  IsOptional,
} from 'class-validator';
import { Grade, ChildAge } from '../../../common/enums';

export class CreateBookingDto {
  // 로그인 토큰의 사용자로 자동 설정되므로 요청 본문에서는 선택
  @IsString()
  @IsOptional()
  parentId?: string; // User.id

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date 형식은 YYYY-MM-DD 입니다.' })
  date: string;

  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime 형식은 HH:mm 입니다.' })
  startTime: string;

  @IsInt()
  @Min(1)
  @Max(24)
  hours: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(ChildAge)
  childAge: ChildAge;

  @IsEnum(Grade)
  grade: Grade;

  // 부모가 직접 선택한 전문가 User.id (선택 안 하면 자동 매칭)
  @IsString()
  @IsOptional()
  workerId?: string;
}
