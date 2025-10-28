# 화면별 구성요소 기능 및 정책

## 공통 데이터 및 상태 관리
- 공지 데이터는 `localStorage`의 `aidt_notices` 키에 저장되며, 초기 구동 시 `src/data/mock-notices.json`의 목 데이터로 채워집니다. (`src/components/ConditionalNoticeComponents.tsx`, `src/app/notice/page.tsx`)
- 사용자 지정 카테고리는 `aidt_custom_categories` 키를 사용하며, 기본값은 `src/lib/categoryManager.ts`의 `DEFAULT_CATEGORIES`를 따릅니다. 변경 시 `categoriesUpdated` 커스텀 이벤트를 발생시켜 다른 탭에서도 동기화합니다.
- 공지 읽음 여부는 `aidt_read_notices`, 배너/모달 닫기 상태는 `aidt_banner_dismissed_{id}`와 `aidt_modal_dismissed_{id}` 키에 저장됩니다. 유지 기간은 `DismissDuration` 정책을 따릅니다. (`src/lib/utils.ts`)
- 루트 레이아웃 (`src/app/layout.tsx`)은 전역적으로 `ConditionalNoticeComponents`를 주입하여, 관리자 페이지와 `?admin=true` 모드가 아닌 화면에서만 배너/모달이 노출되도록 제어합니다.

## 전역 컴포넌트
| 구성요소 | 위치 | 기능 | 정책 |
| --- | --- | --- | --- |
| `Header` | `src/components/Header.tsx` | 상단 고정 헤더, 공지/알림/설정 버튼 | 공지 아이콘 클릭 시 `/notice`로 이동, 새 공지가 있다고 가정하고 빨간 점 표시 |
| `NoticeBanner` | `src/components/notice/NoticeBanner.tsx` | 조건부 배너 캐러셀 | `showInBanner`가 true이고 **현재 시각 기준 `published` 상태**이며 기간/닫기 정책을 통과한 공지 중 우선순위(`priority`)가 낮은 순으로 노출. 닫기 시 기간별 유지, 단순 닫기는 세션 한정 |
| `NoticeModal` | `src/components/notice/NoticeModal.tsx` | 팝업 모달 캐러셀 | `showAsModal`이 true이고 **현재 시각 기준 `published` 상태**이며 기간/닫기 정책을 통과한 항목을 우선순위 순으로 노출. 닫기 버튼은 유지 기간 라벨과 함께 표시 |
| `RichTextEditor` | `src/components/editor/RichTextEditor.tsx` | 공지 작성/수정용 Tiptap 에디터 | 볼드/기울임/정렬/이미지 업로드 지원. 이미지 리사이즈 핸들 제공, Base64 이미지 허용 |

## 공지 목록 화면 (`/notice`) – `src/app/notice/page.tsx`
| 구성요소 | 기능 | 정책/동작 |
| --- | --- | --- |
| 뒤로가기 버튼 | 홈으로 이동 | `/`로 라우팅 |
| `SearchBar` | 제목/내용 검색 입력 | 검색 버튼 또는 Enter 입력 시에만 검색 실행. `searchInput`과 `searchQuery`를 분리해 명시적 검색 |
| `CategoryTabs` | 카테고리 필터 | 기본/사용자 지정 카테고리 혼합 목록. `전체` 포함. `categoriesUpdated` 이벤트 수신 |
| 공지 리스트 (`NoticeCard`) | 공지 카드 렌더링 | 조건에 따라 색상/뱃지 변경. `isPinned` 시 상단 고정. 최근 7일 내 생성 && 미열람 시 `NEW` 표시. 클릭 시 상세 페이지 이동. 카테고리 뱃지는 사용자 지정 레이블/이모지를 반영 |
| 정렬/필터 정책 | 공지 데이터 필터링 | `status=draft` 제외, `publishAt` 미도달 공지 제외, `expireAt` 지난 공지 제외. 고정 공지 우선, 이후 생성일 내림차순 정렬 |
| 페이지네이션 | 페이지 이동/페이지당 개수 | 기본 20개. 10/20/30 선택 가능. 전체 페이지 번호를 순서대로 표시하되 한 번에 최대 5개 숫자만 노출하며, 맨앞/맨뒤 이동 버튼 제공 |
| `EmptyState` | 검색/공지 없음 처리 | 검색 결과 없음과 전체 공지 없음 2가지 상태 지원 |

## 공지 상세 화면 (`/notice/[id]`) – `src/app/notice/[id]/page.tsx`
| 구성요소 | 기능 | 정책/동작 |
| --- | --- | --- |
| 상단 액션 | 목록 돌아가기, 관리자 수정 | `?admin=true`일 때만 수정 버튼 노출 |
| 공지 메타 정보 | 카테고리, 제목, 작성일 | 조회 시 뷰 카운트 증가 (`aidt_notices` 직접 수정) |
| 본문 영역 | 공지 HTML 렌더링 | `dangerouslySetInnerHTML` 사용 (작성 시 에디터 HTML 반영) |
| 이전/다음 네비게이션 | 인접 공지 이동 | 관리자 모드일 경우 모든 공지, 일반 모드는 **현재 시각 기준 `published` 상태**인 공지만 이동 대상 |
| 발행 정보 박스 (`isAdmin`) | 발행 유형/상태/시간 | `history` 열람 버튼 제공, `NoticeHistoryModal` 호출 |
| `NoticeHistoryModal` | 히스토리 확인 | 액션 우선순위와 타임스탬프 기준 정렬. 상태별 뱃지 색상 구분 |
| 읽음 처리 | 사용자 열람 기록 | 일반 사용자만 `markAsRead` 호출. `aidt_read_notices`에 저장 |

## 공지 관리 목록 (`/admin/notice`) – `src/app/admin/notice/page.tsx`
| 구성요소 | 기능 | 정책/동작 |
| --- | --- | --- |
| 헤더 액션 | 새 공지 작성 버튼 | `/admin/notice/new`로 이동 |
| 검색 영역 | 제목 검색 | Enter/버튼으로 실행. 검색어 변경 시 즉시 검색하지 않고 명시적 실행 필요 |
| 카테고리 필터 | 사용자 지정 카테고리 토글 | 선택 유지. `CategorySettingsModal`로 사용자 카테고리 관리 가능하며 수정/추가/삭제 시 `categoriesUpdated` 이벤트로 즉시 동기화 |
| 상태 및 표시 옵션 필터 | 상태, 고정, 배너, 모달 필터 | 다중 선택 가능. 상태는 `determineNoticeStatus`로 산출된 현재 상태 기준 |
| 리스트 테이블 | 공지 목록 | `displayNumber`는 생성일 오름차순 기준 번호를 부여해 정렬 토글 지원 |
| 관리 액션 | 수정, 숨김(만료), 노출, 삭제 | 숨김 시 `status`를 `expired`로 변경하고 히스토리에 액션 추가. 삭제/숨김 시 확인 창 표시 |
| 페이지네이션 | 목록 이동 | 기본 20개, 10/20/30 선택 가능. 전체 페이지 번호를 순서대로 표시하되 한 번에 최대 5개 숫자만 노출하며, 맨앞/맨뒤 이동 버튼 제공 |
| `CategorySettingsModal` | 카테고리 추가/수정/삭제 | 마지막 카테고리는 삭제 불가. 공지가 존재하는 카테고리 삭제 시 대체 카테고리 지정 후 교체 진행 |

## 공지 작성 (`/admin/notice/new`) – `src/app/admin/notice/new/page.tsx`
| 구성요소 | 기능 | 정책/동작 |
| --- | --- | --- |
| 기본 정보 섹션 | 카테고리/제목/내용 설정 | 제목/내용 미입력 시 저장 불가 (alert) |
| 전시 옵션 섹션 | 배너/모달 옵션 | `showInBanner`, `showAsModal` 토글. 제목/본문 재사용 여부 선택. 시작/종료일, 유지기간 설정 |
| 발행 옵션 섹션 | 우선순위/예약/만료 | `priority` 1~5, `publishAt`/`expireAt` 옵션 토글 및 ISO 문자열 저장 |
| 저장 버튼들 | 임시저장/발행 | `determineNoticeStatus`로 상태 재계산. 발행 시 예약 시간에 따라 `scheduled` 처리. 저장 후 `/admin/notice`로 이동 |
| `NoticePreviewModal` | 배너/모달/상세 미리보기 탭 | 실제 사용자 화면과 동일한 레이아웃 미리보기 제공. 옵션 미사용 시 안내 메시지 노출 |
| 데이터 저장 | localStorage 갱신 | 신규 공지는 배열 상단에 `unshift`로 추가. 히스토리에 `created`와 필요 시 `published` 기록 |

## 공지 수정 (`/admin/notice/[id]/edit`) – `src/app/admin/notice/[id]/edit/page.tsx`
| 구성요소 | 기능 | 정책/동작 |
| --- | --- | --- |
| 초기 데이터 로드 | 기존 공지 불러오기 | `localStorage`에서 ID 검색. 존재하지 않으면 기본값 유지 |
| 폼 초기화 | 날짜 필드 변환 | ISO/날짜 문자열을 `datetime-local` 형식으로 맞춰 표시 |
| 저장 버튼 | 수정 완료 | 임시저장 기능 없음. 기존 상태와 비교해 히스토리 업데이트 (`published`, `expired`, `updated` 등) |
| 옵션 동기화 | 배너/모달/만료/예약 | 비활성화 시 관련 필드 제거. 토글 변경 시 상태 재계산 |
| 발행 정보 카드 | 상세 화면과 동일한 발행 유형/일시/상태 표기 | 관리자 전용. 히스토리 버튼으로 `NoticeHistoryModal` 호출, 현재 시각 기준 상태 배지 표시 |
| 미리보기 | 신규 페이지와 동일 | `NoticePreviewModal` 공유 |
| 데이터 업데이트 | localStorage 갱신 | 수정 시 `updatedAt` 갱신, 히스토리에 변경 내역 추가 후 목록으로 이동 |

## 카테고리 관리 모달 – `src/components/admin/CategorySettingsModal.tsx`
- 카테고리 추가 시 레이블 입력 필수, 이모지/색상 선택 가능. ID는 타임스탬프 기반으로 자동 생성.
- 카테고리 삭제 시 해당 카테고리를 사용하는 공지가 존재하면 대체 카테고리 선택 모달을 표시하고 일괄 변경 후 삭제.
- 변경 사항 저장 시 `onUpdate` 콜백으로 목록 컴포넌트가 `getCategories`를 다시 불러오도록 트리거합니다.
