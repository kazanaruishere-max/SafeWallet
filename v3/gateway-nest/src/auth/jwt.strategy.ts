import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Check for MFA (TOTP) in AMR (Authentication Method Reference)
    const isMfaAuthenticated = payload.amr?.includes('mfa') || payload.amr?.includes('totp');
    
    return { 
      userId: payload.sub, 
      email: payload.email, 
      tenantId: payload.tenantId,
      mfaVerified: !!isMfaAuthenticated
    };
  }
}
