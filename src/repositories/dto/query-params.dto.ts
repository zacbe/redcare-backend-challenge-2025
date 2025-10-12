import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RepositoriesPopularityQueryDto {
  @ApiProperty({
    description: 'Programming language',
    example: 'TypeScript',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  language!: string;

  @ApiProperty({
    description: 'Earliest creation date',
    example: '2024-01-01',
  })
  @IsDateString({}, { message: 'createdFrom must be a valid ISO date string' })
  @IsOptional()
  createdFrom!: string;
}
