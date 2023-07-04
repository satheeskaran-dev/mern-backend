import { IsNotEmpty, IsString } from 'class-validator';

export class ActivateDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
