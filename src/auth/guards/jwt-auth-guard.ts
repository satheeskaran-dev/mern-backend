import {
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ApiResponseDto } from 'src/common/api-response';
import { CustomException } from 'src/common/exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments

    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        // Token has expired
        throw new UnauthorizedException(
          new CustomException(401, 'Token has expired !'),
        );
      }
      throw (
        err ||
        new UnauthorizedException(
          new CustomException(401, 'Token not provided !'),
        )
      );
    }
    return user;
  }
}
