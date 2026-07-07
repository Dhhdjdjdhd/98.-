import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

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
}
