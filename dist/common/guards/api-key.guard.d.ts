import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
export declare class ApiKeyGuard implements CanActivate {
    private readonly configService;
    private readonly reflector;
    constructor(configService: ConfigService, reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
