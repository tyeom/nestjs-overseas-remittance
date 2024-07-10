export class ForexDto {
    id: number
    code: string
    currencyCode: string
    currencyName: string
    country: string
    name: string
    date: Date
    time: Date
    recurrenceCount: number
    basePrice: number
    openingPrice: number
    highPrice: number
    lowPrice: number
    change: string
    changePrice: number
    usDollarRate: number
    high52wPrice: number
    high52wDate: Date
    low52wPrice: number
    low52wDate: Date
    currencyUnit: number
    timestamp:bigint
    changeRate:number
    signedChangePrice:number
    signedChangeRate:number
  }