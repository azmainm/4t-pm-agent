"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const app_module_js_1 = require("./app.module.js");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.enableCors({
        origin: [
            'http://localhost:3001',
            'http://localhost:3000',
            'https://sherpaprompt-admin.vercel.app',
            /\.vercel\.app$/,
        ],
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableShutdownHooks();
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('app.port', 3000);
    await app.listen(port);
    const logger = app.get(nestjs_pino_1.Logger);
    logger.log(`PM Agent running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map