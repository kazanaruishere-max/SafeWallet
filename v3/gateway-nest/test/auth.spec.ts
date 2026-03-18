<<<<<<< HEAD
// v3/gateway-nest/test/auth.spec.ts
=======
>>>>>>> 7fa1416d021156d01b5169f1739fac21d9ce3c81
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return payload', async () => {
    const payload = { sub: 'user-123', email: 'test@example.com', tenantId: 'tenant-1' };
    const result = await strategy.validate(payload);
    expect(result).toEqual({ 
      userId: 'user-123', 
      email: 'test@example.com', 
      tenantId: 'tenant-1',
      mfaVerified: false 
    });
  });
});
