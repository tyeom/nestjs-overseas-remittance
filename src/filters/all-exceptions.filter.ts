import { ExceptionFilter, Catch, ArgumentsHost, HttpException, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const resultCode = status;
    let resultMsg;

    if(resultCode === HttpStatus.UNAUTHORIZED &&
      exception instanceof UnauthorizedException) {
        resultMsg = (exception.getResponse() as any).message || '사용할 수 없는 토큰입니다.';
        resultMsg = resultMsg.replace(/Unauthorized/g, '사용할 수 없는 토큰입니다.');
    }
    else
    // exception 객체가 HttpException 객체인지 비교
    // HttpException 객체면서 resultMsg 속성이 없다면 기본 HttpException 객체의 message 사용
    // 아닌 경우 'Internal server error' 표시
    resultMsg = exception instanceof HttpException
      ? (exception.getResponse() as any).resultMsg || (exception.getResponse() as any).message
      : 'Internal server error';

    response.status(status).json({
      resultCode,
      resultMsg,
    });
  }
}
