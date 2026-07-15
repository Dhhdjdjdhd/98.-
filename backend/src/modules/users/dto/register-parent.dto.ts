import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsOptional,
  IsArray,
} from 'class-validator';

export class RegisterParentDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @MinLength(4, { message: '비밀번호는 4자 이상이어야 합니다.' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  // ---- 산모 정보 (필수) ----
  @IsString()
  @IsNotEmpty({ message: '생년월일을 입력하세요.' })
  birthDate: string;

  @IsString()
  @IsNotEmpty({ message: '직업을 입력하세요.' })
  job: string;

  @IsString()
  @IsNotEmpty({ message: '알러지 항목을 입력하세요. (없으면 "없음")' })
  allergy: string;

  @IsString()
  @IsNotEmpty({ message: '과거력을 입력하세요. (없으면 "없음")' })
  pastHistory: string;

  @IsString()
  @IsNotEmpty({ message: '전염성 질환 여부를 입력하세요. (없으면 "없음")' })
  infectiousDisease: string;

  @IsString()
  @IsNotEmpty({ message: '가족력을 입력하세요. (없으면 "없음")' })
  familyHistory: string;

  @IsString()
  @IsNotEmpty({ message: '특이사항·주의할 점·바라는 점을 입력하세요. (없으면 "없음")' })
  specialNotes: string;

  // 분만 이력 (없을 수 있음 — 초산모)
  @IsOptional()
  @IsArray()
  deliveries?: { date: string; gender: string }[];

  // ---- 고지 의무 동의 서명 (필수) ----
  @IsString()
  @IsNotEmpty({ message: '고지 의무 동의 서명이 필요합니다.' })
  consentSignature: string; // dataURL
}
