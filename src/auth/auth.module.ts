import { Module } from '@nestjs/common';
import { MsGraphAuthService } from './ms-graph-auth.service.js';

@Module({
  providers: [MsGraphAuthService],
  exports: [MsGraphAuthService],
})
export class AuthModule {}
