import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class ActivateDto {
  image: string | null;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
