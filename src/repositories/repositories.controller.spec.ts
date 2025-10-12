import { Test, TestingModule } from '@nestjs/testing';

import { GithubService } from '../github/github.service';
import { RepositoriesPopularityQueryDto } from './dto/query-params.dto';
import { RepositoriesController } from './repositories.controller';

describe('RepositoriesController', () => {
  let controller: RepositoriesController;
  let ghService: { getPopular: jest.Mock };

  beforeEach(async () => {
    ghService = { getPopular: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepositoriesController],
      providers: [{ provide: GithubService, useValue: ghService }],
    }).compile();

    controller = module.get<RepositoriesController>(RepositoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('calls GithubService.getPopular with query params and returns result', async () => {
    const query = {
      language: 'TypeScript',
      createdFrom: '2024-01-01',
    } as RepositoriesPopularityQueryDto;
    const mocked = [{ fullName: 'org/repo', score: 0.9 }];
    ghService.getPopular.mockResolvedValue(mocked);

    const result = await controller.getRepositoriesByPopularity(query);

    expect(ghService.getPopular).toHaveBeenCalledWith(
      'TypeScript',
      '2024-01-01',
    );
    expect(result).toBe(mocked);
  });

  it('propagates errors from GithubService', async () => {
    const query = {
      language: 'TS',
      createdFrom: '2024-01-01',
    } as RepositoriesPopularityQueryDto;
    ghService.getPopular.mockRejectedValue(new Error('error'));

    await expect(controller.getRepositoriesByPopularity(query)).rejects.toThrow(
      'error',
    );
  });
});
