import { Injectable } from '@nestjs/common';
import mammoth from 'mammoth';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class DocxParserService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('DocxParserService');
  }

  async extractText(buffer: Buffer): Promise<string> {
    this.logger.info(
      { sizeBytes: buffer.length },
      'Extracting text from .docx',
    );

    const result = await mammoth.extractRawText({ buffer });

    if (result.messages.length > 0) {
      this.logger.warn(
        { messages: result.messages },
        'Warnings during .docx parsing',
      );
    }

    this.logger.info(
      { textLength: result.value.length },
      'Text extracted from .docx',
    );

    return result.value;
  }
}
