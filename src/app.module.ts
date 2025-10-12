import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { GithubModule } from './github/github.module';
import { RepositoriesController } from './repositories/repositories.controller';
import { ScoringModule } from './scoring/scoring.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          // 10 requests per minute
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    GithubModule,
    ScoringModule,
  ],
  controllers: [RepositoriesController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
