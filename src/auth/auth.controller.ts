// import { GoogleAuthGuard } from './guards/google-auth-guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from 'src/user/dto/register.dto';
import { ApiResponseDto } from 'src/common/api-response';
import { LoginDto } from 'src/user/dto/login.dto';
import { Request } from 'express';
import { ActivateDto } from 'src/user/dto/activate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveImageToStorage } from 'src/utils/helpers/imageStorage';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponseDto> {
    return await this.authService.register(registerDto);
  }
  @Post('activate')
  @UseInterceptors(FileInterceptor('image', saveImageToStorage))
  async activate(
    @UploadedFile() file: Express.Multer.File,
    @Body() activateDto: ActivateDto,
  ) {
    return await this.authService.activateUser({
      image: file?.path || null,
      ...activateDto,
    });
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Get('refresh')
  async refreshToken(@Req() request: Request): Promise<ApiResponseDto> {
    return await this.authService.refreshToken(request?.headers?.authorization);
  }
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async handleGoogleLogin() {
    return { msg: 'athentication ' };
  }
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async handleGoogleRedirect(@Req() req, @Res() res) {
    // Include the user details in the response
    const user = req.user;
    res.redirect(
      `${this.config.get(
        'FRONTEND_BASE_URL',
      )}/sso/google?data=${encodeURIComponent(JSON.stringify(user))}`,
    );
  }
}
