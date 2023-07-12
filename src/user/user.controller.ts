import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponseDto } from 'src/common/api-response';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/public.decorator';
import { saveImageToStorage } from 'src/utils/helpers/imageStorage';

@Controller('users')
@Public()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async getAllUsers(): Promise<ApiResponseDto> {
    return await this.userService.findAll();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    console.log(file);
    return 'upload controller';
  }
}
