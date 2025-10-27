'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NoticeBanner from './notice/NoticeBanner';
import NoticeModal from './notice/NoticeModal';

function NoticeComponents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminPage = pathname?.startsWith('/admin');
  const isAdminMode = searchParams.get('admin') === 'true';

  // 관리자 페이지 또는 관리자 모드에서는 배너와 모달을 표시하지 않음
  if (isAdminPage || isAdminMode) {
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
