import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { IRepository } from '../common/interfaces/repository.interface';
import { handleGithubError } from '../common/utils/github-error';
import { IGithubSearchResponse } from './interfaces/github-response.interface';

@Injectable()
export class GithubClient {
  private readonly logger = new Logger(GithubClient.name);
  private readonly baseUrl: string;
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('GITHUB_API_URL')!;
  }

  private getHeaders(): Record<string, string> {
    return {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  private mapSearchResponseToRepositories(
    data: IGithubSearchResponse,
  ): IRepository[] {
    return data.items.map((item) => ({
      fullName: item.full_name,
      htmlUrl: item.html_url,
      description: item.description,
      language: item.language,
      stargazers: item.stargazers_count,
      forks: item.forks_count,
      updatedAt: item.updated_at,
      createdAt: item.created_at,
    }));
  }

  async getRepositories(
    language: string,
    createdFrom: string,
  ): Promise<IRepository[]> {
    const qualifiers: string[] = [];
    if (language?.trim()) qualifiers.push(`language:${language.trim()}`);
    if (createdFrom?.trim()) qualifiers.push(`created:>=${createdFrom.trim()}`);
    const q = qualifiers.join(' ');

    const url = `${this.baseUrl}/search/repositories`;
    const params = { q };
    this.logger.debug({ params });

    try {
      const response = await firstValueFrom(
        this.http.get<IGithubSearchResponse>(url, {
          params,
          headers: this.getHeaders(),
        }),
      );
      return this.mapSearchResponseToRepositories(response.data);
    } catch (error) {
      this.logger.error('GitHub API call failed');
      handleGithubError(error);
    }
  }
}
