import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RegisterParentDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
