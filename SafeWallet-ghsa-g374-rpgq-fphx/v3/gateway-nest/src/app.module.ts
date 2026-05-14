import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: 100,
          },
        ],
        storage: new ThrottlerStorageRedisService({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
        }) as any,
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'ocr-tasks',
    }),
    AuthModule,
    TerminusModule,
  ],
  controllers: [ScanController],
  providers: [
    ScanService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
