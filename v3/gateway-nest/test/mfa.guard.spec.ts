import { Test, TestingModule } from '@nestjs/testing';
import { MfaGuard } from '../src/auth/mfa.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('MfaGuard', () => {
  let guard: MfaGuard;

  beforeEach(() => {
    guard = new MfaGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if mfaVerified is true', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { mfaVerified: true },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw ForbiddenException if user is missing', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: null,
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if mfaVerified is false', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { mfaVerified: false },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });
});
