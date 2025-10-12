import { ApiProperty } from '@nestjs/swagger';

import { RepositoryDTO } from './repository.dto';

export class ResponseBodyDTO {
  @ApiProperty({ example: 'OK' })
  status: string;
  @ApiProperty({ example: 1234 })
  total_count: number;
  @ApiProperty({ type: [RepositoryDTO] })
  repositories: RepositoryDTO[];
}
