import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // Login uses IsNotEmpty (not MinLength) so a wrong password returns 401,
  // matching the "invalid credentials" contract rather than a validation 400.
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;

  @IsString({ message: 'Kata sandi harus berupa teks' })
  @IsNotEmpty({ message: 'Kata sandi tidak boleh kosong' })
  password: string;
}
