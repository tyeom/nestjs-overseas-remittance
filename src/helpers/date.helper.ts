/**
   * @remarks
   * 기준 날짜에서 0시 0분 반환
   * 
   * @param date - 기준 날짜
   * 
   * @returns Date 객체
   */
export function getStartOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

/**
   * @remarks
   * 기준 날짜에서 23시 59분 반환
   * 
   * @param date - 기준 날짜
   * 
   * @returns Date 객체
   */
export function getEndOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}