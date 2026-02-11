import { OnModuleInit } from '@nestjs/common';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { MsGraphAuthService } from '../auth/ms-graph-auth.service.js';
export declare class GraphClientService implements OnModuleInit {
    private readonly authService;
    private client;
    constructor(authService: MsGraphAuthService);
    onModuleInit(): void;
    getClient(): Client;
}
