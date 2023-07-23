import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID:
        '446695918403-l1clhsgm6a7hujhr1qbctl6b88gsbbnn.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:8000/api/v1/auth/google/redirect',
      scope: ['profile', 'email'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    console.log('Access token =>', accessToken);
    console.log('Refresh token =>', refreshToken);
    console.log('Profile =>', profile);

    done(null, profile);
  }
}
