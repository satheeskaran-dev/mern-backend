import {
  Injectable,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from './user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';
import { ApiResponseDto } from 'src/common/api-response';
import {
  CustomBadRequestException,
  CustomNotFoundException,
} from 'src/common/exceptions';
import { ActivateDto } from './dto/activate.dto';

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

  async findByEmailWithoutPassword(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ?? null;
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

  async register(registerDto: RegisterDto): Promise<User> {
    const userExist = await this.userModel.findOne(
      {
        email: registerDto.email,
      },
      '+password',
    );

    if (userExist?.password)
      throw new BadRequestException(
        new CustomBadRequestException(
          'You have already registered please login !',
        ),
      );
    if (userExist && !userExist?.password) {
      const ssoUser = await this.userModel.findByIdAndUpdate(
        userExist._id,
        registerDto,
        { new: true },
      );
      return ssoUser;
    }

    const newUser = new this.userModel(registerDto);
    if (!newUser)
      throw new NotFoundException(
        new CustomNotFoundException('Registration failed !'),
      );

    return newUser;
  }

  async activate(activateDto: ActivateDto): Promise<User> {
    try {
      const user = await this.userModel
        .findOne({ activateToken: activateDto.token }, '+password')
        .exec();

      if (!user)
        throw new BadRequestException(
          new CustomBadRequestException(
            'This account already activated please login !',
          ),
        );
      return user;
    } catch (err) {
      throw err;
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
