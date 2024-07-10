import { Body, Controller, Post, Res, Req, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreateReceptionDto } from './dto/create-reception.dto';
import { GetUser } from '../auth/get-user.decorator'
import { User } from '../users/entities/user.entity';
import { CustomException } from '../commons/custom.exception';
import { instanceToPlain } from 'class-transformer';

@Controller('transfer')
@UseGuards(AuthGuard('jwt'))
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post('/quote')
  async quote(@Res() res, @Body() createQuoteDto: CreateQuoteDto, @GetUser() user:User) {
    const quote = await this.quoteService.createQuote(createQuoteDto, user);
    if(quote) {
      const result = {  resultCode: 200, resultMsg: 'OK', quote: instanceToPlain(quote) };
      res.status(HttpStatus.OK).json(result);
    }
    else {
      throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, '내부 오류');
    }
  }

  @Post('/request')
  async reception(@Res() res, @Body() createReceptionDto: CreateReceptionDto, @GetUser() user:User) {
    const reception = await this.quoteService.createReception(createReceptionDto, user);
    if(reception) {
      const result = {  resultCode: 200, resultMsg: 'OK' };
      res.status(HttpStatus.OK).json(result);
    }
    else {
      throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, '내부 오류');
    }
  }

  @Get('/list')
  async transferList(@Res() res, @GetUser() user:User) {
    const transferList = await this.quoteService.transferList(user);
    if(transferList) {
      const result = {  resultCode: 200, resultMsg: 'OK', ... transferList };
      res.status(HttpStatus.OK).json(result);
    }
    else {
      throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, '내부 오류');
    }
  }
}
