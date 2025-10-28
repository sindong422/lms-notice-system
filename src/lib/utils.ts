import { DismissDuration } from '@/types/notice';

// 기간을 밀리초로 변환
export const getDismissDurationMs = (duration: DismissDuration = '1day'): number => {
  const durations: Record<DismissDuration, number> = {
    '1hour': 60 * 60 * 1000,
    '3hours': 3 * 60 * 60 * 1000,
    '6hours': 6 * 60 * 60 * 1000,
    '12hours': 12 * 60 * 60 * 1000,
    '1day': 24 * 60 * 60 * 1000,
    '3days': 3 * 24 * 60 * 60 * 1000,
    '1week': 7 * 24 * 60 * 60 * 1000,
    'permanent': Infinity,
  };
  return durations[duration];
};

// 닫기 상태 확인
export const isDismissed = (
  noticeId: string,
  type: 'banner' | 'modal',
  duration?: DismissDuration
): boolean => {
  if (typeof window === 'undefined') return false;

  const key = `aidt_${type}_dismissed_${noticeId}`;
  const dismissedTime = localStorage.getItem(key);

  if (!dismissedTime) return false;
  if (!duration) duration = '1day';

  const durationMs = getDismissDurationMs(duration);
  if (durationMs === Infinity) return true;

  const elapsed = Date.now() - new Date(dismissedTime).getTime();
  return elapsed < durationMs;
};

// 닫기 상태 저장
export const setDismissed = (
  noticeId: string,
  type: 'banner' | 'modal'
): void => {
  if (typeof window === 'undefined') return;

  const key = `aidt_${type}_dismissed_${noticeId}`;
  localStorage.setItem(key, new Date().toISOString());
};

// 닫기 유지 기간 옵션 레이블
export const dismissDurationLabels: Record<DismissDuration, string> = {
  '1hour': '1시간 동안 보지 않기',
  '3hours': '3시간 동안 보지 않기',
  '6hours': '6시간 동안 보지 않기',
  '12hours': '12시간 동안 보지 않기',
  '1day': '오늘 하루 보지 않기',
  '3days': '3일 동안 보지 않기',
  '1week': '일주일 동안 보지 않기',
  'permanent': '다시 보지 않기',
};

// 우선순위 레이블
export const priorityLabels: Record<number, string> = {
  1: '🔴 최상 (긴급)',
  2: '🟠 높음',
  3: '🟡 보통',
  4: '🟢 낮음',
  5: '🔵 최하',
};

// 상태 레이블 한글 매핑
export const noticeStatusLabels: Record<string, string> = {
  draft: '임시저장',
  scheduled: '예약됨',
  published: '발행됨',
  expired: '숨겨짐',
};

// 공지 상태 자동 판별
export const determineNoticeStatus = (
  publishAt?: string,
  expireAt?: string,
  currentStatus?: string
): string => {
  const now = new Date();

  // 임시저장이면 그대로 유지
  if (currentStatus === 'draft') return 'draft';

  // 만료 체크
  if (expireAt && new Date(expireAt) < now) {
    return 'expired';
  }

  // 예약 체크
  if (publishAt && new Date(publishAt) > now) {
    return 'scheduled';
  }

  // 발행됨
  return 'published';
};

// 공지사항 읽음 상태 저장
export const markAsRead = (noticeId: string): void => {
  if (typeof window === 'undefined') return;

  const key = 'aidt_read_notices';
  const stored = localStorage.getItem(key);
  const readNotices: string[] = stored ? JSON.parse(stored) : [];

  // 중복 방지
  if (!readNotices.includes(noticeId)) {
    readNotices.push(noticeId);
    localStorage.setItem(key, JSON.stringify(readNotices));
  }
};

// 공지사항 읽음 상태 확인
export const isRead = (noticeId: string): boolean => {
  if (typeof window === 'undefined') return false;

  const key = 'aidt_read_notices';
  const stored = localStorage.getItem(key);
  if (!stored) return false;

  const readNotices: string[] = JSON.parse(stored);
  return readNotices.includes(noticeId);
};
