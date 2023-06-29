import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from 'src/user/dto/register.dto';
import { ApiResponseDto } from 'src/common/api-response';
import { LoginDto } from 'src/user/dto/login.dto';
import { Request } from 'express';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponseDto> {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Get('refresh')
  async refreshToken(@Req() request: Request): Promise<ApiResponseDto> {
    return await this.authService.refreshToken(request?.headers?.authorization);
  }
}
