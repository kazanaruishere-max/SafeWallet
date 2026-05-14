import { Test, TestingModule } from '@nestjs/testing';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform response correctly', (done) => {
    const mockData = { id: 1, name: 'Test' };
    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };

    const mockContext = {} as ExecutionContext;

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.timestamp).toBeDefined();
      done();
    });
  });
});
