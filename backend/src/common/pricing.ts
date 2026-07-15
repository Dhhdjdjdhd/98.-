// 예약 금액 계산 (등급 시급 × 시간, 플랫폼 수수료)
import { BadRequestException } from '@nestjs/common';
import { Grade, GRADE_HOURLY, PLATFORM_FEE_RATE, COLLECTIONS } from './enums';
import { StorageService } from './storage/storage.interface';

export interface PriceBreakdown {
  hourly: number; // 등급 시급
  base: number; // 부모 결제액 (시급 × 시간)
  feeRate: number; // 수수료율
  feeAmount: number; // 플랫폼 수수료 (base × feeRate)
  workerPayout: number; // 근무자 정산액 (base − feeAmount)
}

// 등급 시급 계산. hourlyOverride가 있으면(관리자 설정값) 그 값을 사용한다.
export function priceBooking(grade: Grade, hours: number, hourlyOverride?: number): PriceBreakdown {
  const hourly = hourlyOverride ?? GRADE_HOURLY[grade];
  const base = hourly * hours;
  const feeAmount = Math.round(base * PLATFORM_FEE_RATE);
  const workerPayout = base - feeAmount;
  return { hourly, base, feeRate: PLATFORM_FEE_RATE, feeAmount, workerPayout };
}

// ---- 등급 시급 설정(관리자) : SETTINGS 컬렉션의 단일 문서로 보관 ----
const PRICING_ID = 'grade-pricing';
const GRADE_KEYS: Grade[] = [Grade.A, Grade.B, Grade.C, Grade.D];

// 저장된 등급 시급을 반환. 미설정 시 기본값(GRADE_HOURLY).
export async function readGradeHourly(db: StorageService): Promise<Record<Grade, number>> {
  const doc = await db.findById<any>(COLLECTIONS.SETTINGS, PRICING_ID);
  if (!doc) return { ...GRADE_HOURLY };
  const out = { ...GRADE_HOURLY };
  for (const g of GRADE_KEYS) {
    if (typeof doc[g] === 'number') out[g] = doc[g];
  }
  return out;
}

// 등급 시급 수정(부분 갱신). 값 검증 후 upsert, 최종 값을 반환.
export async function writeGradeHourly(
  db: StorageService,
  patch: Partial<Record<Grade, number>>,
): Promise<Record<Grade, number>> {
  const current = await readGradeHourly(db);
  const next = { ...current };
  for (const g of GRADE_KEYS) {
    const v = patch[g];
    if (v === undefined || v === null) continue;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) {
      throw new BadRequestException('시급은 0 이상의 숫자여야 합니다.');
    }
    next[g] = Math.round(n);
  }
  const existing = await db.findById<any>(COLLECTIONS.SETTINGS, PRICING_ID);
  if (existing) {
    await db.update(COLLECTIONS.SETTINGS, PRICING_ID, next);
  } else {
    await db.insert(COLLECTIONS.SETTINGS, { id: PRICING_ID, ...next });
  }
  return next;
}
