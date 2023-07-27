import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class ActivateDto {
  image: string | null;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
