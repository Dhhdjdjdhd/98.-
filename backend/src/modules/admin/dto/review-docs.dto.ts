import { IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { Grade } from '../../../common/enums';

// 자격 검수 시 서류 확인 결과 (부분 갱신)
export class ReviewDocsDto {
  @IsBoolean() @IsOptional() license?: boolean;
  @IsBoolean() @IsOptional() career?: boolean;
  @IsBoolean() @IsOptional() idCard?: boolean;
  @IsBoolean() @IsOptional() criminalCheck?: boolean;
  @IsBoolean() @IsOptional() childAbuseCheck?: boolean;
  @IsBoolean() @IsOptional() healthCert?: boolean;

  @IsEnum(Grade) @IsOptional() grade?: Grade;
}

export class RejectDto {
  @IsOptional()
  reason?: string;
}
