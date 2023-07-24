import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import generateJwtPayload from 'src/utils/helpers/generateJwtPayload';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    super({
      clientID: config.get('GOOGLE_SSO_CLIENT_ID'),
      clientSecret: config.get('GOOGLE_SSO_CLIENT_SECRET'),
      callbackURL: config.get('GOOGLE_SSO_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const user = await this.authService.findOrCreateUser(profile);
    const payload = generateJwtPayload(user._id, user.email);

    const token = await this.jwtService.signAsync(payload);
    user.refreshId = payload.refreshId;
    await user.save();
    done(null, { user, token });
  }
}
