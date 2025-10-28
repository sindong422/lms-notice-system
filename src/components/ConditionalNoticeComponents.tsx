'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NoticeBanner from './notice/NoticeBanner';
import NoticeModal from './notice/NoticeModal';
import mockData from '@/data/mock-notices.json';
import { Notice } from '@/types/notice';

function NoticeComponents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminPage = pathname?.startsWith('/admin');
  const isAdminMode = searchParams.get('admin') === 'true';
  const [isInitialized, setIsInitialized] = useState(false);

  // localStorage 초기화 (최초 실행 시)
  useEffect(() => {
    const stored = localStorage.getItem('aidt_notices');
    if (!stored) {
      const mockNotices = mockData.notices as Notice[];
      localStorage.setItem('aidt_notices', JSON.stringify(mockNotices));
    }
    setIsInitialized(true);
  }, []);

  // 관리자 페이지 또는 관리자 모드에서는 배너와 모달을 표시하지 않음
  if (isAdminPage || isAdminMode) {
    return null;
  }

  // localStorage 초기화 전에는 렌더링하지 않음
  if (!isInitialized) {
    return null;
  }

  return (
    <>
      <NoticeBanner />
      <NoticeModal />
    </>
  );
}

export default function ConditionalNoticeComponents() {
  return (
    <Suspense fallback={null}>
      <NoticeComponents />
    </Suspense>
  );
}
