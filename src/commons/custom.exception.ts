import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(httpStatus: HttpStatus, resultMsg: string) {
    super({ httpStatus, resultMsg }, httpStatus);
  }
}
