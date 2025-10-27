'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Notice } from '@/types/notice';
import { isDismissed, setDismissed, dismissDurationLabels } from '@/lib/utils';

export default function NoticeBanner() {
  const router = useRouter();
  const [bannerNotices, setBannerNotices] = useState<Notice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 배너 표시할 공지들 찾기
    const stored = localStorage.getItem('aidt_notices');
    if (!stored) return;

    const notices: Notice[] = JSON.parse(stored);
    const today = new Date();

    // 배너 표시 조건:
    // 1. showInBanner가 true
    // 2. 표시 기간 내
    // 3. 닫기 유지 기간 동안 닫지 않은 공지
    // 우선순위 정렬 (낮은 숫자가 우선)
    const activeBanners = notices
      .filter(notice => {
        if (!notice.showInBanner) return false;

        // 기간 체크
        if (notice.bannerStartDate) {
          const startDate = new Date(notice.bannerStartDate);
          if (today < startDate) return false;
        }
        if (notice.bannerEndDate) {
          const endDate = new Date(notice.bannerEndDate);
          if (today > endDate) return false;
        }

        // 닫기 상태 체크 (새 유틸 함수 사용)
        if (isDismissed(notice.id, 'banner', notice.bannerDismissDuration)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => (a.priority || 3) - (b.priority || 3));

    setBannerNotices(activeBanners);
  }, []);

  // 자동 슬라이드 (5초마다)
  useEffect(() => {
    if (bannerNotices.length <= 1 || !isAutoPlaying || isPaused) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerNotices.length);
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [bannerNotices.length, isAutoPlaying, isPaused]);

  const handleClose = () => {
    const currentBanner = bannerNotices[currentIndex];
    if (currentBanner) {
      // 현재 배너만 닫기 상태 저장
      setDismissed(currentBanner.id, 'banner');

      // 배너 목록에서 제거
      const updatedBanners = bannerNotices.filter((_, idx) => idx !== currentIndex);
      setBannerNotices(updatedBanners);

      // 인덱스 조정
      if (updatedBanners.length > 0) {
        setCurrentIndex((prev) => Math.min(prev, updatedBanners.length - 1));
      }
    }
  };

  const handleSimpleClose = () => {
    // 단순히 현재 배너만 목록에서 제거 (localStorage에 저장 안함)
    const updatedBanners = bannerNotices.filter((_, idx) => idx !== currentIndex);
    setBannerNotices(updatedBanners);

    // 인덱스 조정
    if (updatedBanners.length > 0) {
      setCurrentIndex((prev) => Math.min(prev, updatedBanners.length - 1));
    }
  };

  const handleClick = () => {
    const currentBanner = bannerNotices[currentIndex];
    if (currentBanner) {
      router.push(`/notice/${currentBanner.id}`);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? bannerNotices.length - 1 : prev - 1
    );
    setIsPaused(true); // 수동 조작 시 자동 재생 일시정지
    setTimeout(() => setIsPaused(false), 10000); // 10초 후 재개
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerNotices.length);
    setIsPaused(true); // 수동 조작 시 자동 재생 일시정지
    setTimeout(() => setIsPaused(false), 10000); // 10초 후 재개
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true); // 수동 조작 시 자동 재생 일시정지
    setTimeout(() => setIsPaused(false), 10000); // 10초 후 재개
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
    setIsPaused(false);
  };

  const handleMouseEnter = () => {
    if (bannerNotices.length > 1) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (bannerNotices.length > 1 && isAutoPlaying) {
      setIsPaused(false);
    }
  };

  if (bannerNotices.length === 0) return null;

  const currentBanner = bannerNotices[currentIndex];

  // 카테고리별 스타일
  const getBannerStyle = () => {
    switch (currentBanner.category) {
      case 'urgent':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'update':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'event':
        return 'bg-pink-50 border-pink-200 text-pink-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getEmoji = () => {
    switch (currentBanner.category) {
      case 'urgent':
        return '🔴';
      case 'update':
        return '⚙️';
      case 'event':
        return '🎁';
      default:
        return '📌';
    }
  };

  return (
    <div
      className={`border-b ${getBannerStyle()} sticky top-0 z-50`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* 배너 내용 */}
          <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-lg flex-shrink-0">{getEmoji()}</span>
              <button
                onClick={handleClick}
                className="font-medium truncate hover:underline text-left"
              >
                {currentBanner.bannerContent || currentBanner.title}
              </button>

              {/* 페이지 카운터 (여러 배너가 있을 때만 표시) */}
              {bannerNotices.length > 1 && (
                <span className="text-xs opacity-60 flex-shrink-0 ml-2">
                  {currentIndex + 1} / {bannerNotices.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* 여러 배너가 있을 때만 이전/자동재생/다음 버튼 표시 */}
              {bannerNotices.length > 1 && (
                <>
                  {/* 이전 버튼 */}
                  <button
                    onClick={goToPrevious}
                    className="p-1 hover:bg-black/10 rounded transition-colors"
                    aria-label="이전 배너"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* 자동 재생 제어 버튼 */}
                  <button
                    onClick={toggleAutoPlay}
                    className="p-1 hover:bg-black/10 rounded transition-colors"
                    aria-label={isAutoPlaying ? '자동 재생 중지' : '자동 재생 시작'}
                    title={isAutoPlaying ? '자동 재생 중지' : '자동 재생 시작'}
                  >
                    {isAutoPlaying && !isPaused ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>

                  {/* 다음 버튼 */}
                  <button
                    onClick={goToNext}
                    className="p-1 hover:bg-black/10 rounded transition-colors"
                    aria-label="다음 배너"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={handleClose}
                className={`px-3 py-1 rounded text-sm transition-colors border ${
                  currentBanner.category === 'urgent'
                    ? 'bg-white border-red-300 text-red-700 hover:bg-red-50'
                    : currentBanner.category === 'update'
                    ? 'bg-white border-yellow-400 text-yellow-800 hover:bg-yellow-50'
                    : currentBanner.category === 'event'
                    ? 'bg-white border-pink-300 text-pink-700 hover:bg-pink-50'
                    : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
                }`}
                aria-label="배너 닫기"
              >
                {dismissDurationLabels[currentBanner.bannerDismissDuration || '1day']}
              </button>

              {/* 단순 닫기 X 버튼 */}
              <button
                onClick={handleSimpleClose}
                className="p-1 hover:bg-black/10 rounded transition-colors"
                aria-label="닫기"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
