import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfidentialClientApplication,
  type Configuration,
} from '@azure/msal-node';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class MsGraphAuthService implements OnModuleInit {
  private msalClient!: ConfidentialClientApplication;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('MsGraphAuth');
  }

  onModuleInit() {
    const msalConfig: Configuration = {
      auth: {
        clientId: this.configService.get<string>('azure.clientId')!,
        authority: `https://login.microsoftonline.com/${this.configService.get<string>('azure.tenantId')}`,
        clientSecret: this.configService.get<string>('azure.clientSecret'),
      },
    };
    this.msalClient = new ConfidentialClientApplication(msalConfig);
    this.logger.info('MSAL client initialized');
  }

  async getAccessToken(): Promise<string> {
    const result = await this.msalClient.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });

    if (!result?.accessToken) {
      throw new Error('Failed to acquire access token from Azure AD');
    }

    return result.accessToken;
  }
}
