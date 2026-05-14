import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * MfaGuard ensures the user session is authenticated using Multi-Factor Authentication.
 * This checks the 'mfaVerified' flag added by the JwtStrategy.
 */
@Injectable()
export class MfaGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // In production, we can toggle this via config or specific user settings.
    // For this security update, we enforce it for sensitive endpoints.
    if (!user || !user.mfaVerified) {
      throw new ForbiddenException(
        'Multi-Factor Authentication (MFA) is required for this action. Please enable and verify MFA in your account settings.',
      );
    }

    return true;
  }
}
