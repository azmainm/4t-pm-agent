import { Module } from '@nestjs/common';
import { DocxGeneratorService } from './docx-generator.service.js';

@Module({
  providers: [DocxGeneratorService],
  exports: [DocxGeneratorService],
})
export class DocxModule {}
