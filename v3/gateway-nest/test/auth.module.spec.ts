import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from '../src/auth/jwt.strategy';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ JWT_SECRET: 'test-secret' })],
        }),
        AuthModule,
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide JwtStrategy', () => {
    const strategy = module.get(JwtStrategy);
    expect(strategy).toBeDefined();
  });
});
