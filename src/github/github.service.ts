import { Injectable, Logger } from '@nestjs/common';

import { IRepository } from '../common/interfaces/repository.interface';
import { ScoringService } from '../scoring/scoring.service';
import { GithubClient } from './github.client';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  constructor(
    private readonly gh: GithubClient,
    private readonly scoring: ScoringService,
  ) {}

  async getPopular(
    language: string,
    createdFrom: string,
  ): Promise<IRepository[]> {
    const repositories = await this.gh.getRepositories(language, createdFrom);
    const rankedRepositories = this.scoring.rankRepositories(repositories);
    return rankedRepositories;
  }
}
