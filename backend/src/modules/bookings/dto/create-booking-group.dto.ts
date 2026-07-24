import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  Matches,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Grade, ChildAge } from '../../../common/enums';

// 여러 날짜 묶음 예약 생성 DTO
export class CreateBookingGroupDto {
  @IsString()
  @IsOptional()
  parentId?: string;

  @IsArray()
  @ArrayNotEmpty({ message: '날짜를 하나 이상 선택하세요.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { each: true, message: 'date 형식은 YYYY-MM-DD 입니다.' })
  dates: string[];

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

  // 부모가 직접 선택한 전문가 (모든 날짜 담당)
  @IsString()
  @IsOptional()
  workerId?: string;
}
