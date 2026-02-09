import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET) - should return 200', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200);
  });

  it('/api/ingestion/run (POST) - should require API key', () => {
    return request(app.getHttpServer())
      .post('/api/ingestion/run')
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
