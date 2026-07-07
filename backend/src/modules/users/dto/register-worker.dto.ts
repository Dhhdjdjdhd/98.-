import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Grade, LicenseType } from '../../../common/enums';

export class RegisterWorkerDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @MinLength(4, { message: '비밀번호는 4자 이상이어야 합니다.' })
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(LicenseType)
  licenseType: LicenseType;

  // 신청 등급 (관리자 검수 시 조정 가능)
  @IsEnum(Grade)
  grade: Grade;

  @IsInt()
  @Min(0)
  @Max(50)
  careerYears: number;

  @IsString()
  @IsOptional()
  careerNote?: string;
}
