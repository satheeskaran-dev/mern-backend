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
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from './dto/jwt-payload.dto';
import { MailService } from 'src/mail/mail.service';
import { ActivateDto } from 'src/user/dto/activate.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<ApiResponseDto> {
    // const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    // return await this.userService.register(registerDto);

    try {
      const user = await this.userService.register(registerDto);
      const token = await this.jwtService.signAsync({
        email: registerDto.email,
      });

      user.activateToken = token;

      await user.save();
      await this.mailService.sendMail(
        registerDto.email,
        'Activate link',
        'activate',
        { activateLink: 'http://localhost:3000/activate?token=' + token },
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
    try {
      const user = await this.userService.activate(activateDto);
      const hashedPassword = await bcrypt.hash(activateDto.password, 10);
      user.password = hashedPassword;
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
    try {
      const user = await this.userService.findByEmail(loginDto.email);
      const isMatch = await bcrypt.compare(loginDto.password, user.password);
      if (!isMatch)
        throw new BadRequestException(
          new CustomBadRequestException('You provided password is incorrect !'),
        );

      // Generate to attach with token for refresh token purpose
      const refreshExp = moment().add(3, 'minute').unix();
      const refreshId = uuidv4();

      const payload: JwtPayload = {
        id: user._id,
        email: user.email,
        refreshExp,
        refreshId,
      };

      const token = await this.jwtService.signAsync(payload);

      //save the unique id to user collection
      user.refreshId = refreshId;
      await user.save();
      const { password, ...userWithoutPassword } = user.toObject();

      return new ApiResponseDto(true, HttpStatus.OK, 'Login successfully !', {
        user: userWithoutPassword,
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
