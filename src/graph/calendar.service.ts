import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { GraphClientService } from './graph-client.service.js';

export interface CalendarEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  onlineMeeting?: { joinUrl: string };
}

@Injectable()
export class CalendarService {
  constructor(
    private readonly graphClient: GraphClientService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('CalendarService');
  }

  async getTodayEvents(subjectFilter: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const targetUserId = this.configService.get<string>('azure.targetUserId')!;

    this.logger.info(
      { date: startDate.toISOString().split('T')[0], subjectFilter },
      'Fetching calendar events',
    );

    const response = await this.graphClient
      .getClient()
      .api(`/users/${targetUserId}/calendarView`)
      .query({
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
      })
      .select('id,subject,start,end,onlineMeeting')
      .get();

    const events: CalendarEvent[] = response.value || [];
    const filtered = events.filter((e) =>
      e.subject.toLowerCase().includes(subjectFilter.toLowerCase()),
    );

    if (filtered.length > 0) {
      this.logger.info({ count: filtered.length }, 'Events found');
    } else {
      this.logger.warn('No matching events found');
    }

    return filtered;
  }

  async fetchTodayStandup(): Promise<CalendarEvent | null> {
    const subjectFilter = this.configService.get<string>(
      'teams.standupSubjectFilter',
    )!;

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await this.getTodayEvents(subjectFilter, startOfDay, endOfDay);
    return events.length > 0 ? events[0] : null;
  }
}
