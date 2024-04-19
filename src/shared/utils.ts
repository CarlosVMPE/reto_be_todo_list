import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from './constants';

/* Manejador de excepciones para codigos de error por el servidor */
export const exceptionFn = async (code) => {
  console.log('CODE: ', code);
  if (code == 400) {
    return new BadRequestException(ERROR_MESSAGES.ERROR_400);
  } else if (code == 401) {
    return new UnauthorizedException(ERROR_MESSAGES.ERROR_401);
  } else if (code == 500) {
    return new InternalServerErrorException(ERROR_MESSAGES.ERROR_500);
  } else {
    return new BadRequestException(ERROR_MESSAGES.ERROR_400);
  }
};
