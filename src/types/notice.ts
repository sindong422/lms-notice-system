// types/notice.ts

export type NoticeCategory = 'urgent' | 'update' | 'event' | 'announcement';

export type NoticeStatus =
  | 'draft'       // 임시저장
  | 'scheduled'   // 예약됨
  | 'published'   // 발행됨
  | 'expired';    // 만료됨

export type DismissDuration =
  | '1hour'      // 1시간
  | '3hours'     // 3시간
  | '6hours'     // 6시간
  | '12hours'    // 12시간
  | '1day'       // 1일
  | '3days'      // 3일
  | '1week'      // 1주일
  | 'permanent'; // 영구히 보지 않기

export type NoticeHistoryAction =
  | 'created'      // 생성
  | 'published'    // 발행
  | 'updated'      // 수정
  | 'expired'      // 만료
  | 'reactivated'; // 재활성화

export interface NoticeHistoryEntry {
  action: NoticeHistoryAction;
  timestamp: string;  // ISO 8601
  status: NoticeStatus;
  note?: string;      // 추가 설명
}

export interface Notice {
  id: string;
  category: NoticeCategory;
  title: string;
  content: string;  // HTML string
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  viewCount: number;

  // 노출 옵션
  isPinned: boolean;           // 목록 상단 고정
  showInBanner?: boolean;      // 헤더 배너 표시
  bannerContent?: string;      // 배너에 표시될 내용 (미지정 시 title 사용)
  bannerStartDate?: string;    // 배너 표시 시작일 (ISO 8601)
  bannerEndDate?: string;      // 배너 표시 종료일 (ISO 8601)
  bannerDismissDuration?: DismissDuration;  // 배너 닫기 유지 기간 (기본값: '1day')
  showAsModal?: boolean;       // 최초 접속 시 모달 표시
  modalContent?: string;       // 모달에 표시될 제목 (미지정 시 title 사용)
  modalBody?: string;          // 모달에 표시될 본문 (미지정 시 content 사용)
  modalStartDate?: string;     // 모달 표시 시작일 (ISO 8601)
  modalEndDate?: string;       // 모달 표시 종료일 (ISO 8601)
  modalDismissDuration?: DismissDuration;   // 모달 닫기 유지 기간 (기본값: '1day')
  priority?: number;           // 우선순위 1~5, 기본값 3 (낮은 숫자가 우선)
  expireAt?: string;           // 자동 만료 일시 (ISO 8601)
  publishAt?: string;          // 예약 발행 일시 (ISO 8601)

  // 관리 정보
  author: {
    id: string;
    name: string;
  };
  status: NoticeStatus;
  history?: NoticeHistoryEntry[];  // 발행 히스토리
}

export interface CategoryInfo {
  id: NoticeCategory | 'all';
  label: string;
  emoji: string;
}
