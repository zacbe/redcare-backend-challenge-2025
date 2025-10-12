import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ScoringModule } from '../scoring/scoring.module';
import { GithubClient } from './github.client';
import { GithubService } from './github.service';

@Module({
  imports: [HttpModule, ScoringModule],
  providers: [GithubService, GithubClient],
  exports: [GithubService],
})
export class GithubModule {}
