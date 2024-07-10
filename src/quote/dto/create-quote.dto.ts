import { IsEnum, IsNotEmpty, IsString, IsNumber, Validate  } from 'class-validator'
import { IsPositiveValidator } from '../../commons/is-positive.validator'
import { CurrencyType } from '../../users/enums/currency-type.enum'

export class CreateQuoteDto {
  @IsNumber()
  @Validate(IsPositiveValidator)
  @IsNotEmpty()
  amount: number

  @IsEnum(CurrencyType)
  @IsNotEmpty()
  targetCurrency: CurrencyType
}