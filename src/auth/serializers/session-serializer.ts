import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }
  serializeUser(user: any, done: Function) {
    console.log('serialize =>', user);
    done(null, user);
  }
  deserializeUser(payload: any, done: Function) {
    console.log('deserialize =>', payload);
  }
}
