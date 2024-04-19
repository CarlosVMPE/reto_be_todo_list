import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { exceptionFn } from './utils';
import { ERROR_MESSAGES } from './constants';

describe('exceptionFn', () => {
  it('should throw error with status 400', async () => {
    expect(await exceptionFn(400)).toEqual(
      new BadRequestException(ERROR_MESSAGES.ERROR_400),
    );
  });

  it('should throw error with status 401', async () => {
    expect(await exceptionFn(401)).toEqual(
      new UnauthorizedException(ERROR_MESSAGES.ERROR_401),
    );
  });

  it('should throw error with status 500', async () => {
    expect(await exceptionFn(500)).toEqual(
      new InternalServerErrorException(ERROR_MESSAGES.ERROR_500),
    );
  });

  it('should throw error as default', async () => {
    expect(await exceptionFn(505)).toEqual(
      new BadRequestException(ERROR_MESSAGES.ERROR_400),
    );
  });
});
