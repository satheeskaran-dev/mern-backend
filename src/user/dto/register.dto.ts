import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { REGEX } from 'src/utils/regex';

export class RegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;

  image?: string;

  // @IsNotEmpty()
  // @IsString()
  // @Matches(REGEX.PASSWORD.RULE, { message: REGEX.PASSWORD.MSG })
  // password: string;
}
