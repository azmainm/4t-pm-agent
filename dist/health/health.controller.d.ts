import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private readonly health;
    private readonly mongoose;
    constructor(health: HealthCheckService, mongoose: MongooseHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
