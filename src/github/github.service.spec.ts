import { BadGatewayException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { IRepository } from '../common/interfaces/repository.interface';
import { ScoringService } from '../scoring/scoring.service';
import { GithubClient } from './github.client';
import { GithubService } from './github.service';

describe('GithubService', () => {
  let service: GithubService;
  let ghMock: { getRepositories: jest.Mock };
  let scoringMock: { rankRepositories: jest.Mock };

  beforeEach(async () => {
    ghMock = { getRepositories: jest.fn() };
    scoringMock = { rankRepositories: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        { provide: GithubClient, useValue: ghMock },
        { provide: ScoringService, useValue: scoringMock },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calls GithubClient with args and passes repos to ScoringService', async () => {
    const language = 'TypeScript';
    const createdFrom = '2024-01-01';

    const repos: IRepository[] = [
      {
        fullName: 'org/repo',
        htmlUrl: 'https://github.com/org/repo',
        description: 'desc',
        language: 'TypeScript',
        stargazers: 10,
        forks: 2,
        updatedAt: '2024-02-01T00:00:00Z',
        createdAt: '2023-12-01T00:00:00Z',
      },
    ];

    const ranked = [{ ...repos[0], score: 0.75 }] as unknown as IRepository[];

    ghMock.getRepositories.mockResolvedValue(repos);
    scoringMock.rankRepositories.mockReturnValue(ranked);

    const out = await service.getPopular(language, createdFrom);

    expect(ghMock.getRepositories).toHaveBeenCalledTimes(1);
    expect(ghMock.getRepositories).toHaveBeenCalledWith(language, createdFrom);

    expect(scoringMock.rankRepositories).toHaveBeenCalledTimes(1);
    expect(scoringMock.rankRepositories).toHaveBeenCalledWith(repos);

    expect(out).toBe(ranked);
  });

  it('returns whatever the scorer returns (empty array case)', async () => {
    ghMock.getRepositories.mockResolvedValue([]);
    scoringMock.rankRepositories.mockReturnValue([]);

    const out = await service.getPopular('TS', '2024-01-01');
    expect(out).toEqual([]);
    expect(scoringMock.rankRepositories).toHaveBeenCalledWith([]);
  });

  it('propagates errors from the GithubClient and does not call scorer on failure', async () => {
    const upstreamErr = new BadGatewayException('Upstream failed');
    ghMock.getRepositories.mockRejectedValue(upstreamErr);

    await expect(service.getPopular('TS', '2024-01-01')).rejects.toThrow(
      BadGatewayException,
    );

    expect(scoringMock.rankRepositories).not.toHaveBeenCalled();
  });
});
