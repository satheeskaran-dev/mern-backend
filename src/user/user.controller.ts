import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponseDto } from 'src/common/api-response';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async getAllUsers(): Promise<ApiResponseDto> {
    return await this.userService.findAll();
  }
}
