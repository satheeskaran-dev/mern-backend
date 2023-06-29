import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter valid email !' })
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
