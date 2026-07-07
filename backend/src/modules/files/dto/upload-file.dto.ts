import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { DOC_KINDS } from '../../../common/enums';

export class UploadFileDto {
  @IsString()
  @IsIn(DOC_KINDS as unknown as string[])
  kind: string;

  // data:image/...;base64,.... 형태
  @IsString()
  @IsNotEmpty()
  dataUrl: string;

  @IsString()
  @IsOptional()
  mimeType?: string;
}
