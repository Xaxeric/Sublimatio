import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import type { PayloadType } from '../entities/payload.entity';

export class CreatePayloadDto {
  @IsString({ message: 'Nama payload harus berupa teks' })
  @IsNotEmpty({ message: 'Nama payload tidak boleh kosong' })
  @MinLength(3, { message: 'Nama payload minimal harus memiliki 3 karakter' })
  name: string;

  @IsString({ message: 'Tipe payload harus berupa string' })
  @IsNotEmpty({ message: 'Tipe payload tidak boleh kosong' })
  @IsIn(['file', 'link', 'text'], {
    message: 'Tipe payload harus bernilai salah satu dari: file, link, atau text',
  })
  type: PayloadType;

  @IsOptional()
  @IsString({ message: 'Konten payload harus berupa teks' })
  content?: string;

  @IsOptional()
  @IsString({ message: 'URL payload harus berupa string yang valid' })
  url?: string;

  @IsOptional()
  @IsString({ message: 'Identitas device harus berupa string' })
  device?: string;

  @IsNumber({}, { message: 'totalTTL harus berupa bilangan angka' })
  @IsPositive({ message: 'totalTTL harus berupa nilai positif (> 0 detik)' })
  totalTTL: number;

  @IsOptional()
  @IsNumber({}, { message: 'remainingTTL harus berupa angka' })
  remainingTTL?: number;

  @IsOptional()
  @IsString({ message: 'Ukuran payload harus berupa string' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'MIME type harus berupa string' })
  mime?: string;

  @IsOptional()
  @IsString({ message: 'Hash payload harus berupa string' })
  hash?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPinned harus berupa nilai boolean (true/false)' })
  isPinned?: boolean;
}
