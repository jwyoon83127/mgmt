/**
 * 경영집행위원회 회차 계산 유틸리티
 * 연도의 첫 번째 금요일부터 현재까지의 금요일 수를 회차로 계산
 */

const STORAGE_KEY_PREFIX = 'mgmt_round_offset_';

/** 특정 연도의 경영집행위원회 회차를 계산 (현재 날짜 기준) */
export function calculateCurrentRound(year: number, referenceDate = new Date()): number {
  // 해당 연도의 첫 번째 금요일 찾기
  const jan1 = new Date(year, 0, 1);
  const dayOfWeek = jan1.getDay(); // 0=일, 5=금
  const daysToFirstFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 12 - dayOfWeek;
  const firstFriday = new Date(year, 0, 1 + daysToFirstFriday);

  // referenceDate가 첫 금요일 이전이면 0
  if (referenceDate < firstFriday) return 0;

  // 첫 금요일부터 referenceDate까지의 주 수 계산
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksDiff = Math.floor((referenceDate.getTime() - firstFriday.getTime()) / msPerWeek);
  return weeksDiff + 1;
}

/** localStorage에서 수동 오프셋을 읽어 회차에 적용 */
export function getRoundWithOffset(year: number, referenceDate = new Date()): number {
  const calculated = calculateCurrentRound(year, referenceDate);
  if (typeof window === 'undefined') return calculated;
  const offset = parseInt(localStorage.getItem(`${STORAGE_KEY_PREFIX}${year}`) || '0', 10);
  return calculated + offset;
}

/** 사용자가 수동으로 회차를 변경했을 때 오프셋 저장 */
export function saveRoundOffset(manualValue: number, year: number, referenceDate = new Date()): void {
  const calculated = calculateCurrentRound(year, referenceDate);
  const offset = manualValue - calculated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${year}`, String(offset));
  }
}

/** 경과 초를 HH:MM:SS 포맷으로 변환 */
export function formatElapsedTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}
