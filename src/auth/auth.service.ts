import {
  HttpStatus,
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ApiResponseDto } from 'src/common/api-response';
import {
  CustomBadRequestException,
  CustomException,
  CustomInternalServerErrorException,
} from 'src/common/exceptions';
import { LoginDto } from 'src/user/dto/login.dto';
import { RegisterDto } from 'src/user/dto/register.dto';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { ActivateDto } from 'src/user/dto/activate.dto';
import { Profile } from 'passport-google-oauth20';
import generateJwtPayload from 'src/utils/helpers/generateJwtPayload';
import { JwtPayload } from './dto/jwt-payload.dto';
import moment from 'moment';
import { User } from 'src/user/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async findOrCreateUser(profile: Profile): Promise<User> {
    const { email, given_name, family_name, picture } = profile._json;

    const user = await this.userService.findByEmailWithoutPassword(email);
    if (!user) {
      const registerDetails = {
        firstName: given_name || '',
        lastName: family_name || '',
        image: picture || null,
        email,
      };

      return await this.userService.register(registerDetails);
    }

    return user;
  }

  async register(registerDto: RegisterDto): Promise<ApiResponseDto> {
    const user = await this.userService.register(registerDto);

    try {
      const token = await this.jwtService.signAsync({
        email: registerDto.email,
      });

      user.activateToken = token;

      const savedUser = await user.save();
      console.log('user obj=>', savedUser);
      await this.mailService.sendMail(
        registerDto.email,
        'Activate link',
        'activate',
        {
          activateLink:
            this.config.get('FRONTEND_BASE_URL') +
            `/activate?user=${encodeURIComponent(JSON.stringify(savedUser))}`,
        },
      );

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

  async activateUser(activateDto: ActivateDto): Promise<ApiResponseDto> {
    const user = await this.userService.activate(activateDto);
    try {
      const hashedPassword = await bcrypt.hash(activateDto.password, 10);
      user.password = hashedPassword;
      user.firstName = activateDto.firstName;
      user.lastName = activateDto.lastName;
      user.activateToken = null;
      if (activateDto.image) user.image = activateDto.image;

      await user.save();
      return new ApiResponseDto(
        true,
        HttpStatus.OK,
        'User activate successfully !',
      );
    } catch (err) {
      throw new InternalServerErrorException(
        new CustomInternalServerErrorException(),
      );
    }
  }

  async login(loginDto: LoginDto): Promise<ApiResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user.password)
      throw new BadRequestException(
        new CustomBadRequestException(`You haven't register this system !`),
      );
    try {
      const isMatch = await bcrypt.compare(loginDto.password, user.password);
      if (!isMatch)
        throw new BadRequestException(
          new CustomBadRequestException('You provided password is incorrect !'),
        );

      const payload = generateJwtPayload(user._id, user.email);

      const token = await this.jwtService.signAsync(payload);

      //save the unique id to user collection
      user.refreshId = payload.refreshId;
      await user.save();
      const { password, refreshId, ...restUser } = user.toObject();

      return new ApiResponseDto(true, HttpStatus.OK, 'Login successfully !', {
        user: restUser,
        token,
      });
    } catch (err) {
      throw err;
    }
  }

  async refreshToken(authorizationHeader: string): Promise<ApiResponseDto> {
    try {
      const token = authorizationHeader.replace('Bearer ', '');
      const decodedToken = this.jwtService.decode(token) as JwtPayload;

      const currentTime = moment().unix();

      if (currentTime > decodedToken.refreshExp)
        throw new ForbiddenException(
          new CustomException(
            HttpStatus.FORBIDDEN,
            'Refresh token has expired !',
          ),
        );

      // To check refresh token id has or not to the user
      const user = await this.userService.findByRefreshId(
        decodedToken?.refreshId,
      );
      user.refreshId = null;
      await user.save();

      const payload: JwtPayload = {
        id: decodedToken.id,
        email: decodedToken.email,
        refreshId: decodedToken.refreshId,
        refreshExp: decodedToken.refreshExp,
      };
      const newToken = await this.jwtService.signAsync(payload);

      return new ApiResponseDto(
        true,
        HttpStatus.OK,
        'Token generated successfully',
        {
          token: newToken,
        },
      );
    } catch (err) {
      throw new ForbiddenException(
        new CustomException(
          HttpStatus.FORBIDDEN,
          'Refresh token has expired !',
        ),
      );
    }
  }
}
