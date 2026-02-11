import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
export declare class MsGraphAuthService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private msalClient;
    constructor(configService: ConfigService, logger: PinoLogger);
    onModuleInit(): void;
    getAccessToken(): Promise<string>;
}
