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
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const graph_client_service_js_1 = require("./graph-client.service.js");
let CalendarService = class CalendarService {
    graphClient;
    configService;
    logger;
    constructor(graphClient, configService, logger) {
        this.graphClient = graphClient;
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext('CalendarService');
    }
    async getTodayEvents(subjectFilter, startDate, endDate) {
        const targetUserId = this.configService.get('azure.targetUserId');
        this.logger.info({ date: startDate.toISOString().split('T')[0], subjectFilter }, 'Fetching calendar events');
        const response = await this.graphClient
            .getClient()
            .api(`/users/${targetUserId}/calendarView`)
            .query({
            startDateTime: startDate.toISOString(),
            endDateTime: endDate.toISOString(),
        })
            .select('id,subject,start,end,onlineMeeting')
            .get();
        const events = response.value || [];
        const filtered = events.filter((e) => e.subject.toLowerCase().includes(subjectFilter.toLowerCase()));
        if (filtered.length > 0) {
            this.logger.info({ count: filtered.length }, 'Events found');
        }
        else {
            this.logger.warn('No matching events found');
        }
        return filtered;
    }
    async fetchTodayStandup() {
        const subjectFilter = this.configService.get('teams.standupSubjectFilter');
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const events = await this.getTodayEvents(subjectFilter, startOfDay, endOfDay);
        return events.length > 0 ? events[0] : null;
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [graph_client_service_js_1.GraphClientService,
        config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map