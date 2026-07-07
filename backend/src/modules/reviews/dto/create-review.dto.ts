import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Role } from '../../../common/enums';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsEnum(Role)
  authorRole: Role; // 부모가 근무자를, 근무자가 부모를 평가

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  comment?: string;
}
