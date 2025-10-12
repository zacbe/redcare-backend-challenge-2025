import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { Observable, of, throwError } from 'rxjs';

import { handleGithubError } from '../common/utils/github-error';
import { GithubClient } from './github.client';
import { IGithubSearchResponse } from './interfaces/github-response.interface';

jest.mock('../common/utils/github-error', () => ({
  handleGithubError: jest.fn(() => {
    throw new Error('mapped-http-exception');
  }),
}));

describe('GithubClient', () => {
  let client: GithubClient;
  const httpServiceMock = { get: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubClient,
        { provide: HttpService, useValue: httpServiceMock },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              (({ GITHUB_API_URL: 'mock-base-url' }) as Record<string, string>)[
                key
              ],
          },
        },
      ],
    }).compile();

    client = module.get<GithubClient>(GithubClient);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  it('builds correct query, sends headers, and maps the response', async () => {
    const apiResponse: IGithubSearchResponse = {
      total_count: 2,
      incomplete_results: false,
      items: [
        {
          full_name: 'org/repo1',
          html_url: 'https://github.com/org/repo1',
          description: 'desc1',
          language: 'TypeScript',
          stargazers_count: 10,
          forks_count: 2,
          updated_at: '2024-01-01T00:00:00Z',
          created_at: '2023-12-01T00:00:00Z',
        },
        {
          full_name: 'org/repo2',
          html_url: 'https://github.com/org/repo2',
          description: 'desc2',
          language: 'JS',
          stargazers_count: 5,
          forks_count: 1,
          updated_at: '2024-02-01T00:00:00Z',
          created_at: '2023-11-01T00:00:00Z',
        },
      ],
    };

    jest.spyOn(httpServiceMock, 'get').mockReturnValueOnce(
      new Observable((subscriber) => {
        subscriber.next({
          data: apiResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as AxiosResponse);
        subscriber.complete();
      }),
    );

    const result = await client.getRepositories(' TypeScript ', ' 2024-01-01 ');

    // make sure the outbound call was made with correct URL, params, and headers
    expect(httpServiceMock.get).toHaveBeenCalledTimes(1);
    const [url, config] = httpServiceMock.get.mock.calls[0];
    expect(url).toBe('mock-base-url/search/repositories');
    expect(config.params).toEqual({
      q: 'language:TypeScript created:>=2024-01-01',
    });
    expect(config.headers).toMatchObject({
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    });

    // eval mapping
    expect(result).toEqual([
      {
        fullName: 'org/repo1',
        htmlUrl: 'https://github.com/org/repo1',
        description: 'desc1',
        language: 'TypeScript',
        stargazers: 10,
        forks: 2,
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2023-12-01T00:00:00Z',
      },
      {
        fullName: 'org/repo2',
        htmlUrl: 'https://github.com/org/repo2',
        description: 'desc2',
        language: 'JS',
        stargazers: 5,
        forks: 1,
        updatedAt: '2024-02-01T00:00:00Z',
        createdAt: '2023-11-01T00:00:00Z',
      },
    ]);
  });

  it('propagates http errors via handleGithubError', async () => {
    const upstreamError = new Error('axios-err');
    httpServiceMock.get.mockReturnValue(throwError(() => upstreamError));

    await expect(client.getRepositories('TS', '2024-01-01')).rejects.toThrow(
      'mapped-http-exception',
    );

    expect(handleGithubError).toHaveBeenCalledTimes(1);
    expect(handleGithubError).toHaveBeenCalledWith(upstreamError);
  });

  it('builds query with single qualifier (createdFrom only)', async () => {
    const apiResponse: IGithubSearchResponse = {
      total_count: 1,
      incomplete_results: false,
      items: [
        {
          full_name: 'org/repo',
          html_url: 'https://github.com/org/repo',
          description: null,
          language: null,
          stargazers_count: 0,
          forks_count: 0,
          updated_at: '2024-01-02T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
    };

    httpServiceMock.get.mockReturnValue(of({ data: apiResponse, headers: {} }));

    const out = await client.getRepositories('', '2024-01-01');
    const [, config] = httpServiceMock.get.mock.calls[0];
    expect(config.params).toEqual({ q: 'created:>=2024-01-01' });

    expect(out).toEqual([
      {
        fullName: 'org/repo',
        htmlUrl: 'https://github.com/org/repo',
        description: null,
        language: null,
        stargazers: 0,
        forks: 0,
        updatedAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]);
  });
});
