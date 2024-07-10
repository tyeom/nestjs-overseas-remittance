import { IsNotEmpty, IsNumber } from 'class-validator'

export class CreateReceptionDto {
  @IsNotEmpty()
  quoteId: number
}