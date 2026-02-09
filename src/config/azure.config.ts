import { registerAs } from '@nestjs/config';

export const azureConfig = registerAs('azure', () => ({
  tenantId: process.env.AZURE_TENANT_ID!,
  clientId: process.env.AZURE_CLIENT_ID!,
  clientSecret: process.env.AZURE_CLIENT_SECRET!,
  targetUserId: process.env.GRAPH_TARGET_USER_ID!,
}));
