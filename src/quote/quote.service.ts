import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreateReceptionDto } from './dto/create-reception.dto';
import { Quote } from './entities/quote.entity';
import { CurrencyType } from '../users/enums/currency-type.enum';
import { CustomException } from '../commons/custom.exception';
import { HttpService } from '@nestjs/axios';
import { ForexDto } from './dto/forex.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { User } from 'src/users/entities/user.entity';
import { QuoteRepository } from './quote.repository';
import { Reception } from './entities/reception.entity';
import { ReceptionRepository } from './reception.repository';
import { TodayTransferInfoDto } from './dto/today-transfer-info.dto';
import e from 'express';
import { Between } from 'typeorm';
import { getStartOfDay, getEndOfDay } from '../helpers/date.helper'
import { IdType } from '../users/enums/id-type-enum';

const forexUri:string = 'https://crix-api-cdn.upbit.com/v1/forex/recent?codes=,FRX.KRWJPY,FRX.KRWUSD';
// usd 송금 수수료율 (1 ~ 100만원)
const commissionRate_usd_1_100:number = 0.002;
// usd 송금 수수료율 (100만원 초과)
const commissionRate_usd_100:number = 0.001;
// usd 고정 수수료 (1 ~ 100만원)
const fixedFee_usd_1_100:number = 1000;
// usd 고정 수수료 (100만원 초과)
const fixedFee_usd_100:number = 3000;
// jpy 송금 수수료율
const commissionRate_jpy:number = 0.005;
// jpy 고정 수수료
const fixedFee_jpy:number = 3000;
// 개인 송금 제한 금액 (USD)
const limit_reg = 1000;
// 법인 송금 제한 금액 (USD)
const limit_business = 5000;

@Injectable()
export class QuoteService {
  constructor(
    private readonly httpService: HttpService,
    private readonly quoteRepository: QuoteRepository,
    private readonly receptionRepository: ReceptionRepository
  ){}

  /**
   * @remarks
   * 수수료 정보
   * 
   * @param currencyType - 화폐 단위
   * @param amount - 보낼 금액
   * 
   * @returns [수수료율, 고정 수수료]
   */
  private getFee(currencyType: CurrencyType, amount: number) : [number, number] {
    if(currencyType === CurrencyType.USD) {
      if(amount <= 1000000) {
        return [commissionRate_usd_1_100, fixedFee_usd_1_100];
      }
      else{
        return [commissionRate_usd_100, fixedFee_usd_100];
      }
    }
    else if(currencyType === CurrencyType.JPY) {
      return [commissionRate_jpy, fixedFee_jpy];
    }
    else {
      throw new CustomException(HttpStatus.BAD_REQUEST, '지원하지 않은 화폐 단위 입니다.');
    }
  }

  /**
   * @remarks
   * 수수료 계산
   * 
   * @param currencyType - 화폐 단위
   * @param amount - 보낼 금액
   * 
   * @returns 수수료
   */
  private feeCalculation(currencyType: CurrencyType, amount: number): number {
    const [commissionRate, fixedFee] = this.getFee(currencyType, amount);
    return (amount * commissionRate + fixedFee);
  }

  /**
   * @remarks
   * 환율 정보 요청
   * 
   * @param currencyType - 화폐 단위
   * 
   * @returns 환율 정보
   */
  private async getForex(currencyType: CurrencyType): Promise<ForexDto> {
    const { data } = await firstValueFrom(
      this.httpService.get<ForexDto[]>(forexUri)
                      .pipe(
                        catchError((error: AxiosError) => {
                          throw new CustomException(HttpStatus.BAD_REQUEST, `외환 정보 요청 오류 - ${error}`);
                        })),
    );

    let code;
    if(currencyType === CurrencyType.USD) {
      code = 'FRX.KRWUSD';
    }
    else if(currencyType === CurrencyType.JPY) {
      code = 'FRX.KRWJPY';
    }
    else {
      throw new CustomException(HttpStatus.BAD_REQUEST, '지원하지 않은 화폐 단위 입니다.');
    }
    const forex = data.find((p) => p.code === code);
    return forex || null;
  }

  /**
   * @remarks
   * 나라에 맞게 소수점 처리
   * 
   * @param amount - 금액
   * @param currencyType - 화폐 단위
   * 
   * @returns 소수점 버림된 금액
   */
  private formatCurrency(amount: number, currencyType: CurrencyType): number {
    const currencyInfo: Record<CurrencyType, number> = {
      [CurrencyType.USD]: 2,  // 미국 달러 - 소수점 이하 2자리
      [CurrencyType.JPY]: 0,  // 일본 엔 - 소수점 이하 0자리
    };

    // 기본 소수 자릿수 가져오기
    const defaultDigits = currencyInfo[currencyType];
    // amount를 기본 소수 자릿수에 맞추어 버림 처리하여 문자열로 변환
    const roundDownAmount = Math.floor(amount * Math.pow(10, defaultDigits)) / Math.pow(10, defaultDigits);
    return roundDownAmount;
  }

  public async createQuote(createQuoteDto: CreateQuoteDto, user:User): Promise<Quote> {
    // 수수료
    const fee = this.feeCalculation(createQuoteDto.targetCurrency, createQuoteDto.amount);
    // 송금 대상 나라 외환 정보 (환율 정보는 실시간으로 바뀌기에 각 나라별로 바로 다시 요청 한다.)
    const forex_target: ForexDto = await this.getForex(createQuoteDto.targetCurrency);
    // usd 외환 정보 (환율 정보는 실시간으로 바뀌기에 각 나라별로 바로 다시 요청 한다.)
    const forex_usd: ForexDto = await this.getForex(CurrencyType.USD);
    if(!forex_target || !forex_usd) {
      throw new CustomException(HttpStatus.BAD_REQUEST, `${createQuoteDto.targetCurrency} 외환 정보를 찾을 수 없습니다.`);
    }
    // 송금 대상 나라 환율
    const exchangeRate_target = (forex_target.basePrice / forex_target.currencyUnit);
    // usd 환율
    const exchangeRate_usd = (forex_usd.basePrice / forex_usd.currencyUnit);
    //받는 금액 = (보내는 금액 - 수수료) / 환율
    const originTargetAmount = (createQuoteDto.amount - fee) / exchangeRate_target;
    const roundDownTargetAmount = this.formatCurrency(originTargetAmount, createQuoteDto.targetCurrency);
    if(roundDownTargetAmount <= 0) {
      throw new CustomException(HttpStatus.BAD_REQUEST, `$받는 금액은 0보다 커야 합니다. - targetCurrency: ${createQuoteDto.targetCurrency} / targetAmount: ${roundDownTargetAmount}`);
    }

    // usd amount
    const originUsdAmount = (createQuoteDto.amount) / exchangeRate_usd;
    const roundDownUsdAmount = this.formatCurrency(originUsdAmount, CurrencyType.USD);

    const quote: Quote = new Quote();
    quote.sourceAmount = createQuoteDto.amount;
    quote.fee = fee;
    quote.targetCurrency = createQuoteDto.targetCurrency;
    quote.exchangeRate = exchangeRate_target;
    quote.targetAmount = roundDownTargetAmount;
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 10);
    quote.expireTime = currentDate;
    quote.usdExchangeRate = exchangeRate_usd;
    quote.usdAmount = roundDownUsdAmount;
    quote.user = user;
    
    await this.quoteRepository.createQuote(quote);

    return quote;
  }

  /**
   * @remarks
   * 오늘 송금 이력 정보 조회
   * 
   * @param user - 유저 정보
   * 
   * @returns 오늘 송금 이력 정보
   */
  private async getTodayTransferInfo(user:User): Promise<TodayTransferInfoDto> {
    if(!user) {
      throw new CustomException(HttpStatus.BAD_REQUEST, '잘못된 요청 - 유저 정보 없음');
    }

    const receptionArr:Reception[] =
      await this.receptionRepository.find({
        relations: ['user', 'quote'],
        where: {
          user: {
            id: user.id
          },
          createdAt: Between(
            getStartOfDay(new Date()),
            getEndOfDay(new Date())
          )
        }
      });

      let todayTransferCount = 0;
      let todayTransferUsdAmount = 0;

      if(receptionArr) {
        todayTransferCount = receptionArr.length;
        todayTransferUsdAmount =
          receptionArr.reduce((usdAmount, obj) => usdAmount + Number(obj.quote.usdAmount), 0);
      }

      const todayTransferInfoDto: TodayTransferInfoDto = new TodayTransferInfoDto();
      todayTransferInfoDto.userId = user.userId;
      todayTransferInfoDto.name = user.name;
      todayTransferInfoDto.todayTransferCount = todayTransferCount;
      todayTransferInfoDto.todayTransferUsdAmount = this.formatCurrency(todayTransferUsdAmount, CurrencyType.USD);
      todayTransferInfoDto.history = receptionArr.map( p => p.quote);
      
      return todayTransferInfoDto;
  }

  /**
   * @remarks
   * 송금 이력 정보 조회
   * 
   * @param user - 유저 정보
   * 
   * @returns 송금 이력 정보
   */
  private async getTransferInfo(user:User): Promise<TodayTransferInfoDto> {
    if(!user) {
      throw new CustomException(HttpStatus.BAD_REQUEST, '잘못된 요청 - 유저 정보 없음');
    }

    const receptionArr:Reception[] =
      await this.receptionRepository.find({
        relations: ['user', 'quote'],
        where: {
          user: {
            id: user.id
          }
        }
      });

      let todayTransferCount = 0;
      let todayTransferUsdAmount = 0;

      if(receptionArr) {
        todayTransferCount = receptionArr.length;
        todayTransferUsdAmount =
          receptionArr.reduce((usdAmount, obj) => usdAmount + Number(obj.quote.usdAmount), 0);
      }

      const todayTransferInfoDto: TodayTransferInfoDto = new TodayTransferInfoDto();
      todayTransferInfoDto.userId = user.userId;
      todayTransferInfoDto.name = user.name;
      todayTransferInfoDto.todayTransferCount = todayTransferCount;
      todayTransferInfoDto.todayTransferUsdAmount = this.formatCurrency(todayTransferUsdAmount, CurrencyType.USD);
      todayTransferInfoDto.history = receptionArr.map( p => p.quote);
      
      return todayTransferInfoDto;
  }

  public async createReception(createQuoteDto: CreateReceptionDto, user:User): Promise<Reception> {
    const todayTransferInfo = await this.getTodayTransferInfo(user)

    const quote:Quote =
      await this.quoteRepository.findOne({
        relations: ['user'],
        where: {
          quoteId: createQuoteDto.quoteId
        }
      });
    if(!quote)
      throw new CustomException(HttpStatus.BAD_REQUEST, '유효하지 않은 견적서 입니다.');

    const currentDate = new Date();
    if(!quote.expireTime ||
      quote.expireTime <= currentDate) {
        throw new CustomException(HttpStatus.BAD_REQUEST, '견적서가 만료 되었습니다.');
    }

    // 오늘 총 송금 금액 (UsdAmount) + 송급 접수 UsdAmount 금액
    const todayTransferUsdAmount_limit = (todayTransferInfo.todayTransferUsdAmount + quote.usdAmount);
    if(user.idType === IdType.REG_NO) {
      if(todayTransferUsdAmount_limit >= limit_reg) {
        throw new CustomException(HttpStatus.BAD_REQUEST, `오늘 송금 한도 초과 입니다. - 총 송금 금액(USD) : ${todayTransferInfo.todayTransferUsdAmount}, 개인 limit: ${limit_reg}`);
      }
    }
    else if(user.idType === IdType.BUSINESS_NO) {
      if(todayTransferUsdAmount_limit >= limit_business) {
        throw new CustomException(HttpStatus.BAD_REQUEST, `오늘 송금 한도 초과 입니다. - 총 송금 금액(USD) : ${todayTransferInfo.todayTransferUsdAmount}, 법인 limit: ${limit_reg}`);
      }
    }

    const foundReception:Reception =
      await this.receptionRepository.findOne({
        where: {
          quote: {
            quoteId: quote.quoteId
          }
        }
      });
    if(foundReception)
      throw new CustomException(HttpStatus.BAD_REQUEST, '이미 요청된 견적서 입니다.');

    const reception: Reception = new Reception();
    reception.quote = quote;
    reception.user = quote.user;
    
    await this.receptionRepository.createReception(reception);

    return reception;
  }

  public async transferList(user:User): Promise<TodayTransferInfoDto> {
    const transferInfo = await this.getTransferInfo(user)
    return transferInfo;
  }
}
