import { Injectable } from '@nestjs/common';

import { IRepository } from '../common/interfaces/repository.interface';

@Injectable()
export class ScoringService {
  private readonly W_STARS = 0.4;
  private readonly W_UPDATED = 0.4;
  private readonly W_FORKS = 0.2;

  rankRepositories(repositories: Array<IRepository>): Array<IRepository> {
    if (!repositories.length) return [];

    const stars = repositories.map((r) => r.stargazers);
    const forks = repositories.map((r) => r.forks);
    const updates = repositories.map((r) =>
      Math.min(new Date(r.updatedAt).getTime(), Date.now()),
    );

    const starsNorm = this.normalizeSumToOne(stars);
    const forksNorm = this.normalizeSumToOne(forks);
    const updatesNorm = this.normalizeSumToOne(updates);

    const scored = repositories.map((r, i) => ({
      ...r,
      score:
        this.W_STARS * starsNorm[i] +
        this.W_UPDATED * updatesNorm[i] +
        this.W_FORKS * forksNorm[i],
    }));

    const sorted = scored.sort((a, b) => b.score - a.score);
    return sorted;
  }

  private normalizeSumToOne(values: number[]): number[] {
    const total = values.reduce((acc, v) => acc + v, 0);
    return values.map((v) => v / total);
  }
}
