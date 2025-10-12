import {
  BadGatewayException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AxiosError } from 'axios';

export function handleGithubError(error: unknown): never {
  if (error instanceof HttpException) throw error;

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? HttpStatus.BAD_GATEWAY;
    const data = error.response?.data ?? {};
    const message = data.message ?? error.message;

    switch (status) {
      case 422:
        throw new UnprocessableEntityException({
          source: 'github',
          message,
          errors: data.errors,
        });
      case 429:
        throw new HttpException(
          { source: 'github', message },
          HttpStatus.TOO_MANY_REQUESTS,
        );

      case 403:
        throw new ForbiddenException({
          source: 'github',
          message,
        });
      default:
        throw new BadGatewayException({ source: 'github', message });
    }
  }

  throw new BadGatewayException({
    source: 'github',
    message: 'Unexpected upstream error',
  });
}
