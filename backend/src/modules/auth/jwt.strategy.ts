import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { LoginUserPayload } from './auth.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  branchId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): LoginUserPayload {
    if (!payload.sub || !payload.role || !payload.branchId) {
      throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Invalid token payload' });
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: '',
      role: payload.role,
      branchId: payload.branchId,
    };
  }
}
