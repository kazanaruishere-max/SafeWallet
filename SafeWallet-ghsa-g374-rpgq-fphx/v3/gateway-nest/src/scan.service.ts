import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios from 'axios';

@Injectable()
export class ScanService {
  constructor(@InjectQueue('ocr-tasks') private ocrQueue: Queue) {}

  async queueOcrTask(userId: string, file: Express.Multer.File) {
    try {
      // 1. Convert file buffer to hex for transport
      const fileContentHex = file.buffer.toString('hex');

      // 2. Request initial hash from Security Module (Rust) for integrity tracking
      const securityRes = await axios.post(`${process.env.SECURITY_MODULE_URL}/hash`, {
        data: fileContentHex,
      });

      const initialHash = securityRes.data.hash;

      // 3. Add to Redis Queue for the Python Worker to pick up
      const job = await this.ocrQueue.add('process_ocr', {
        user_id: userId,
        file_content_hex: fileContentHex,
        file_name: file.originalname,
        initial_hash: initialHash,
      }, {
        attempts: 3,
        backoff: 5000, // Retry after 5s on failure
      });

      return {
        success: true,
        message: 'Scan task queued for processing',
        job_id: job.id,
        initial_hash: initialHash,
      };
    } catch (error) {
      console.error('[!] ScanService Error:', error.message);
      throw new InternalServerErrorException('Failed to initiate scan task');
    }
  }
}
