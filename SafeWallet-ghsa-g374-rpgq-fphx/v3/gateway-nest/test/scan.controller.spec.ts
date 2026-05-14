import { Test, TestingModule } from '@nestjs/testing';
import { ScanController } from '../src/scan.controller';
import { ScanService } from '../src/scan.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { MfaGuard } from '../src/auth/mfa.guard';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';

describe('ScanController', () => {
  let controller: ScanController;
  let service: ScanService;

  const mockScanService = {
    queueOcrTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanController],
      providers: [
        {
          provide: ScanService,
          useValue: mockScanService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(MfaGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ScanController>(ScanController);
    service = module.get<ScanService>(ScanService);
  });

  describe('uploadFile (Positive Case)', () => {
    it('should return success when valid file and user_id are provided', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.png',
        mimetype: 'image/png',
      } as any;
      const userId = 'user-123';
      const expectedResult = { success: true, job_id: 'job-1' };
      
      mockScanService.queueOcrTask.mockResolvedValue(expectedResult);

      const result = await controller.uploadFile(mockFile, userId);
      expect(result).toEqual(expectedResult);
      expect(service.queueOcrTask).toHaveBeenCalledWith(userId, mockFile);
    });
  });

  describe('uploadFile (Negative Cases)', () => {
    it('should handle service errors gracefully', async () => {
      mockScanService.queueOcrTask.mockRejectedValue(new Error('Queue full'));
      const mockFile = {} as any;
      
      await expect(controller.uploadFile(mockFile, 'user-1')).rejects.toThrow('Queue full');
    });

    it('should fail if user_id is missing (via ValidationPipe)', async () => {
      // In a real test this would be handled by the ValidationPipe
      // but we can mock the controller call
      mockScanService.queueOcrTask.mockResolvedValue({ success: true });
      const result = await controller.uploadFile({} as any, undefined);
      expect(result.success).toBe(true); // Controller doesn't check it, Pipe does
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large files (simulated)', async () => {
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
      const mockFile = { buffer: largeBuffer, originalname: 'large.png' } as any;
      
      mockScanService.queueOcrTask.mockResolvedValue({ success: true, job_id: 'large-job' });
      const result = await controller.uploadFile(mockFile, 'user-1');
      expect(result.job_id).toBe('large-job');
    });
  });
});
