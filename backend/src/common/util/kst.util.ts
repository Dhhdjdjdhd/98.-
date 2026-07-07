// KST(한국 표준시) 시간 유틸
// 주의: toISOString() 사용 금지 (UTC 변환 시 날짜/시간 어긋남)
// UTC 기준 시각에 +9시간을 더한 뒤, UTC getter로 '벽시계 값'을 문자열로 조립한다.

const pad = (n: number) => String(n).padStart(2, '0');

// 현재 KST 시각 문자열: 'YYYY-MM-DD HH:mm:ss'
export function nowKst(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return (
    `${kst.getUTCFullYear()}-${pad(kst.getUTCMonth() + 1)}-${pad(kst.getUTCDate())} ` +
    `${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())}:${pad(kst.getUTCSeconds())}`
  );
}

// 현재 KST 날짜 문자열: 'YYYY-MM-DD'
export function todayKst(): string {
  return nowKst().slice(0, 10);
}
