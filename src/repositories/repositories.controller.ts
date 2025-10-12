import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { GithubService } from '../github/github.service';
import { RepositoriesPopularityQueryDto } from './dto/query-params.dto';
import { ResponseBodyDTO } from './dto/response-body.dto';

@ApiTags('Repositories API')
@ApiExtraModels(ResponseBodyDTO)
@Controller('repositories')
export class RepositoriesController {
  private readonly logger = new Logger(RepositoriesController.name);

  constructor(private readonly ghService: GithubService) {}

  @Get('popularity')
  @ApiOkResponse({
    description: 'List of ranked repositories',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath(ResponseBodyDTO) },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  async getRepositoriesByPopularity(
    @Query(ValidationPipe) query: RepositoriesPopularityQueryDto,
  ) {
    const { language, createdFrom } = query;
    const repos = await this.ghService.getPopular(language, createdFrom);
    return repos;
  }
}
