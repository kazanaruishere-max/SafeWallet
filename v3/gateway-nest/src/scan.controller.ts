import { Controller, Post, UseInterceptors, UploadedFile, Body, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScanService } from './scan.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { MfaGuard } from './auth/mfa.guard';

@ApiTags('Scan')
@ApiBearerAuth()
@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, MfaGuard) // MFA is now required for scanning sensitive documents
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload document for AI OCR Analysis (MFA Required)' })
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('user_id') userId: string) {
    return this.scanService.queueOcrTask(userId, file);
  }
}
