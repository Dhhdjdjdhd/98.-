import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCareLogDto {
  @IsString()
  @IsNotEmpty()
  type: string; // feeding, diaper, sleep, bath, play, meal, note

  @IsString()
  @IsOptional()
  @MaxLength(200)
  note?: string;
}
