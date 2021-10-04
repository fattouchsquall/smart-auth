import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtConstant } from '@app/constants/jwt.constant';

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JwtConstant.secret
    });
  }

  /**
   * Returns a validated payload.
   *
   * @param {any} payload
   *
   * @returns {Promise<any>}
   */
  public async validate(payload: any): Promise<any> {
    return {
      iss: payload.iss ?? 'https://smart.com',
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
