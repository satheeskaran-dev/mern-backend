import {
  Injectable,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { User, UserDocument } from './user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';
import { ApiResponseDto } from 'src/common/api-response';
import {
  CustomBadRequestException,
  CustomException,
  CustomInternalServerErrorException,
  CustomNotFoundException,
} from 'src/common/exceptions';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<ApiResponseDto> {
    const users = await this.userModel.find();
    if (!users)
      throw new NotFoundException(
        new CustomNotFoundException('Users not found !'),
      );

    return new ApiResponseDto(
      true,
      HttpStatus.OK,
      'Users get successfully',
      users,
    );
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email }, '+password').exec();
      if (!user)
        throw new NotFoundException(
          new CustomNotFoundException('You provided email is incorrect!'),
        );
      return user;
    } catch (err) {
      throw err;
    }
  }

  //   User register service function

  async register(registerDto: RegisterDto): Promise<ApiResponseDto> {
    const userExist = await this.userModel.findOne({
      email: registerDto.email,
    });

    if (userExist)
      throw new BadRequestException(
        new CustomBadRequestException('Email already exist !'),
      );

    try {
      const newUser = new this.userModel(registerDto);
      if (!newUser)
        throw new NotFoundException(
          new CustomNotFoundException('User not found !'),
        );

      const savedUser = await newUser.save();

      if (savedUser)
        return new ApiResponseDto(
          true,
          HttpStatus.CREATED,
          'User registered successfully !',
        );
    } catch (err) {
      throw new InternalServerErrorException(
        new CustomInternalServerErrorException(),
      );
    }
  }

  async findByRefreshId(refreshId: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ refreshId: refreshId });
      return user;
    } catch (err) {
      throw err;
    }
  }
}
