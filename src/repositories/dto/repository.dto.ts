import { ApiProperty } from '@nestjs/swagger';

export class RepositoryDTO {
  @ApiProperty({
    example: 'google-gemini/gemini-cli',
    description: 'Repository full name (owner/repo)',
  })
  fullName: string;

  @ApiProperty({
    example: 'https://github.com/google-gemini/gemini-cli',
    description: 'URL to the repository on GitHub',
  })
  htmlUrl: string;

  @ApiProperty({
    example: 'A command-line interface for Google Gemini projects',
    description: 'Repository description',
  })
  description: string | null;

  @ApiProperty({
    example: 'TypeScript',
    description: 'Primary programming language',
  })
  language: string | null;

  @ApiProperty({
    example: 1500,
    description: 'Number of stargazers',
  })
  stargazers: number;

  @ApiProperty({
    example: 300,
    description: 'Number of forks',
  })
  forks: number;

  @ApiProperty({
    example: '2024-05-01T12:34:56Z',
    description: 'Last updated date in ISO format',
  })
  updatedAt: string; // ISO string

  @ApiProperty({
    example: '2024-04-15T08:00:00Z',
    description: 'Creation date in ISO format',
  })
  createdAt: string; // ISO string

  @ApiProperty({
    example: 0.95,
    description: 'Relevance score',
  })
  score: number;
}
