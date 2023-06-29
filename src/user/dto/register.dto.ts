import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { REGEX } from 'src/utils/regex';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  // @IsNotEmpty()
  // @IsString()
  // @Matches(REGEX.PASSWORD.RULE, { message: REGEX.PASSWORD.MSG })
  // password: string;
}
