import { Quote } from "../entities/quote.entity"

export class TodayTransferInfoDto {
    userId: string
    name: string
    todayTransferCount: number
    todayTransferUsdAmount: number
    history: Quote[]
  }