import { Test, TestingModule } from '@nestjs/testing';

import { IRepository } from '../common/interfaces/repository.interface';
import { ScoringService } from './scoring.service';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoringService],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an empty array when no repositories are provided', () => {
    const result = service.rankRepositories([]);
    expect(result).toEqual([]);
  });

  it('should add a score field to each repository', () => {
    const repos: IRepository[] = [
      {
        fullName: 'repo1',
        htmlUrl: 'https://github.com/repo1',
        description: null,
        language: 'TS',
        stargazers: 10,
        forks: 5,
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        fullName: 'repo2',
        htmlUrl: 'https://github.com/repo2',
        description: null,
        language: 'JS',
        stargazers: 5,
        forks: 2,
        updatedAt: '2024-02-01T00:00:00Z',
        createdAt: '2023-02-01T00:00:00Z',
      },
    ];

    const result = service.rankRepositories(repos);

    // Should add a score to each repo
    expect(result).toHaveLength(2);
    result.forEach((r) => {
      expect(typeof (r as any).score).toBe('number');
      expect((r as any).score).toBeGreaterThanOrEqual(0);
    });
  });

  it('should sort repositories by score descending', () => {
    const repos: IRepository[] = [
      {
        fullName: 'repo1',
        htmlUrl: '',
        description: null,
        language: null,
        stargazers: 100,
        forks: 10,
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        fullName: 'repo2',
        htmlUrl: '',
        description: null,
        language: null,
        stargazers: 5,
        forks: 1,
        updatedAt: '2024-01-02T00:00:00Z',
        createdAt: '2023-02-01T00:00:00Z',
      },
    ];

    const result = service.rankRepositories(repos);

    // repo1 should have higher score because it has more stars/forks
    expect(result[0].fullName).toBe('repo1');
  });
});
