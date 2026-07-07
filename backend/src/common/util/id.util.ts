// 짧고 읽기 쉬운 도메인 ID 생성 (예: 'bk_a1b2c3d4')
import { randomUUID } from 'crypto';

export function genId(prefix: string): string {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}
