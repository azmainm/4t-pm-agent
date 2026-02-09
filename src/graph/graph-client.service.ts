import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { MsGraphAuthService } from '../auth/ms-graph-auth.service.js';

@Injectable()
export class GraphClientService implements OnModuleInit {
  private client!: Client;

  constructor(private readonly authService: MsGraphAuthService) {}

  onModuleInit() {
    this.client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => this.authService.getAccessToken(),
      },
    });
  }

  getClient(): Client {
    return this.client;
  }
}
