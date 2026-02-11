import { PinoLogger } from 'nestjs-pino';
export declare class DocxParserService {
    private readonly logger;
    constructor(logger: PinoLogger);
    extractText(buffer: Buffer): Promise<string>;
}
