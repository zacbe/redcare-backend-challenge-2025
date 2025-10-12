import {
  HttpException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { IRepository } from '../src/common/interfaces/repository.interface';
import { GithubClient } from '../src/github/github.client';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const ghMock = { getRepositories: jest.fn() };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GithubClient)
      .useValue(ghMock)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /repositories/popularity -> 200 and returns ranked repositories', async () => {
    const rawRepos: IRepository[] = [
      {
        fullName: 'org/repo-low',
        htmlUrl: 'https://github.com/org/repo-low',
        description: null,
        language: 'TS',
        stargazers: 5,
        forks: 1,
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        fullName: 'org/repo-high',
        htmlUrl: 'https://github.com/org/repo-high',
        description: null,
        language: 'TS',
        stargazers: 100,
        forks: 10,
        updatedAt: '2024-02-01T00:00:00Z',
        createdAt: '2023-02-01T00:00:00Z',
      },
    ];
    ghMock.getRepositories.mockResolvedValue(rawRepos);

    const res = await request(app.getHttpServer())
      .get('/repositories/popularity')
      .query({ language: 'TypeScript', createdFrom: '2024-01-01' })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);

    expect(res.body[0].fullName).toBe('org/repo-high');
    expect(typeof res.body[0].score).toBe('number');
  });

  it('GET /repositories/popularity -> 422 when GitHub returns validation error', async () => {
    // Simulate the GithubClient mapping to a 422 HttpException
    ghMock.getRepositories.mockRejectedValue(
      new HttpException(
        {
          source: 'github',
          message: 'Validation Failed',
          errors: [{ message: 'Invalid q' }],
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      ),
    );

    const res = await request(app.getHttpServer())
      .get('/repositories/popularity')
      .query({ language: 'TS' })
      .expect(422);

    expect(res.body.message).toBe('Validation Failed');
    expect(res.body.source).toBe('github');
  });

  it('GET /repositories/popularity -> 429 when rate-limited by GitHub', async () => {
    ghMock.getRepositories.mockRejectedValue(
      new HttpException(
        { source: 'github', message: 'Rate limit exceeded' },
        429, // Too Many Requests
      ),
    );

    const res = await request(app.getHttpServer())
      .get('/repositories/popularity')
      .query({ language: 'ts', createdFrom: '2024-01-01' })
      .expect(429);

    expect(res.body.message).toBe('Rate limit exceeded');
    expect(res.body.source).toBe('github');
  });

  it('GET /repositories/popularity -> 400 when both query params are missing', async () => {
    const res = await request(app.getHttpServer())
      .get('/repositories/popularity')
      .expect(400);
    expect(res.body.statusCode).toBe(400);
  });
});
