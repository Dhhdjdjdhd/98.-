// 예약 금액 계산 (등급 시급 × 시간, 플랫폼 수수료)
import { Grade, GRADE_HOURLY, PLATFORM_FEE_RATE } from './enums';

export interface PriceBreakdown {
  hourly: number; // 등급 시급
  base: number; // 부모 결제액 (시급 × 시간)
  feeRate: number; // 수수료율
  feeAmount: number; // 플랫폼 수수료 (base × feeRate)
  workerPayout: number; // 근무자 정산액 (base − feeAmount)
}

export function priceBooking(grade: Grade, hours: number): PriceBreakdown {
  const hourly = GRADE_HOURLY[grade];
  const base = hourly * hours;
  const feeAmount = Math.round(base * PLATFORM_FEE_RATE);
  const workerPayout = base - feeAmount;
  return { hourly, base, feeRate: PLATFORM_FEE_RATE, feeAmount, workerPayout };
}
