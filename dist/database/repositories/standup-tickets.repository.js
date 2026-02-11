"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandupTicketsRepository = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongodb_1 = require("mongodb");
const nestjs_pino_1 = require("nestjs-pino");
let StandupTicketsRepository = class StandupTicketsRepository {
    configService;
    logger;
    client;
    db;
    transcriptsCollection;
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext('StandupTicketsRepository');
        this.initialize();
    }
    async initialize() {
        const uri = this.configService.get('mongodb.standupTicketsUri');
        this.client = new mongodb_1.MongoClient(uri);
        await this.client.connect();
        this.db = this.client.db('standuptickets');
        this.transcriptsCollection = this.db.collection('transcripts');
        this.logger.info('Connected to standuptickets database');
    }
    async findByDateRange(startDate, endDate) {
        await this.ensureConnected();
        const results = await this.transcriptsCollection
            .find({
            timestamp: { $gte: startDate, $lte: endDate },
        })
            .sort({ timestamp: 1 })
            .toArray();
        return results.map(t => this.parseTranscript(t));
    }
    parseTranscript(transcript) {
        if (typeof transcript.transcript_data === 'string') {
            try {
                transcript.transcript_data = JSON.parse(transcript.transcript_data);
            }
            catch (e) {
                this.logger.error({ error: e.message }, 'Failed to parse transcript_data');
                transcript.transcript_data = [];
            }
        }
        return transcript;
    }
    async findLatest(limit) {
        await this.ensureConnected();
        const results = await this.transcriptsCollection
            .find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();
        return results.map(t => this.parseTranscript(t));
    }
    async findByDate(date) {
        await this.ensureConnected();
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const result = await this.transcriptsCollection.findOne({
            timestamp: { $gte: startOfDay, $lte: endOfDay },
        });
        return result ? this.parseTranscript(result) : null;
    }
    async ensureConnected() {
        if (!this.client || !this.db) {
            await this.initialize();
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.close();
            this.logger.info('Closed standuptickets database connection');
        }
    }
};
exports.StandupTicketsRepository = StandupTicketsRepository;
exports.StandupTicketsRepository = StandupTicketsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], StandupTicketsRepository);
//# sourceMappingURL=standup-tickets.repository.js.map