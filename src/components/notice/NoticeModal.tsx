'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Notice } from '@/types/notice';
import NoticeTag from './NoticeTag';
import { isDismissed, setDismissed, dismissDurationLabels } from '@/lib/utils';

export default function NoticeModal() {
  const router = useRouter();
  const [modalNotices, setModalNotices] = useState<Notice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 모달 표시할 공지들 찾기
    const stored = localStorage.getItem('aidt_notices');
    if (!stored) return;

    const notices: Notice[] = JSON.parse(stored);
    const today = new Date();

    // 모달 표시 조건:
    // 1. showAsModal이 true
    // 2. 표시 기간 내
    // 3. 닫기 유지 기간 동안 닫지 않은 공지
    // 우선순위 정렬 (낮은 숫자가 우선)
    const activeModals = notices
      .filter(notice => {
        if (!notice.showAsModal) return false;

        // 기간 체크
        if (notice.modalStartDate) {
          const startDate = new Date(notice.modalStartDate);
          if (today < startDate) return false;
        }
        if (notice.modalEndDate) {
          const endDate = new Date(notice.modalEndDate);
          if (today > endDate) return false;
        }

        // 닫기 상태 체크 (새 유틸 함수 사용)
        if (isDismissed(notice.id, 'modal', notice.modalDismissDuration)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => (a.priority || 3) - (b.priority || 3));

    if (activeModals.length > 0) {
      setModalNotices(activeModals);
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleDismiss = () => {
    const currentModal = modalNotices[currentIndex];
    if (currentModal) {
      // 현재 모달만 닫기 상태 저장
      setDismissed(currentModal.id, 'modal');

      // 모달 목록에서 제거
      const updatedModals = modalNotices.filter((_, idx) => idx !== currentIndex);
      setModalNotices(updatedModals);

      // 인덱스 조정
      if (updatedModals.length > 0) {
        setCurrentIndex((prev) => Math.min(prev, updatedModals.length - 1));
      } else {
        // 모든 모달이 닫히면 완전히 숨김
        setIsVisible(false);
      }
    }
  };

  const handleViewDetail = () => {
    const currentModal = modalNotices[currentIndex];
    if (currentModal) {
      router.push(`/notice/${currentModal.id}`);
      setIsVisible(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? modalNotices.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % modalNotices.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!isVisible || modalNotices.length === 0) return null;

  const currentModal = modalNotices[currentIndex];

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={handleClose}
      />

      {/* 모달 */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <NoticeTag category={currentModal.category} />
              <h2 className="text-xl font-bold mt-3 text-gray-900">
                {currentModal.modalContent || currentModal.title}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded flex-shrink-0 ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 내용 */}
          <div className="p-6 overflow-y-auto flex-1">
            <div
              className="text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: currentModal.modalBody || currentModal.content
              }}
            />
          </div>

          {/* 캐러셀 네비게이션 (여러 모달이 있을 때만 표시) */}
          {modalNotices.length > 1 && (
            <div className="flex items-center justify-center gap-4 px-6 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={goToPrevious}
                className="p-2 hover:bg-gray-200 rounded-full transition"
                aria-label="이전 공지"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* 도트 인디케이터 */}
              <div className="flex items-center gap-2">
                {modalNotices.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-blue-600 w-4'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`${index + 1}번째 공지로 이동`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="p-2 hover:bg-gray-200 rounded-full transition"
                aria-label="다음 공지"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="text-sm text-gray-600 ml-2">
                {currentIndex + 1} / {modalNotices.length}
              </div>
            </div>
          )}

          {/* 액션 */}
          <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
            >
              {dismissDurationLabels[currentModal.modalDismissDuration || '1day']}
            </button>
            <button
              onClick={handleViewDetail}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              자세히 보기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
