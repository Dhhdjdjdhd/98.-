import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Grade, ChildAge } from '../../../common/enums';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  parentId: string; // User.id

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
}
