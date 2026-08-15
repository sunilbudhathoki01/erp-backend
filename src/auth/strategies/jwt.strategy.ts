import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RequestUser } from 'src/common/types/global.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // reads "Authorization: Bearer <token>"
      ignoreExpiration: false, // reject expired tokens
      secretOrKey: configService.get<string>('jwt.accessSecret'), // must match the secret used to SIGN access tokens
    });
  }

  // Called automatically by Passport ONLY after the token's signature and
  // expiry are already verified. Whatever we return here becomes `request.user`.

  validate(payload: {
    userId: string;
    email: string;
    role: string;
  }): RequestUser {
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  }
}
