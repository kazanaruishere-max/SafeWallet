import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ConfigModule } from '@nestjs/config';
import { ScanController } from '../src/scan.controller';
import { ScanService } from '../src/scan.service';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ 
            JWT_SECRET: 'test-secret',
            REDIS_HOST: 'localhost',
            REDIS_PORT: 6379,
            SECURITY_MODULE_URL: 'http://localhost:8000'
          })],
        }),
        AppModule,
      ],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide ScanController', () => {
    const controller = module.get(ScanController);
    expect(controller).toBeDefined();
  });

  it('should provide ScanService', () => {
    const service = module.get(ScanService);
    expect(service).toBeDefined();
  });
});
