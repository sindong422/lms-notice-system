// app/notice/[id]/page.tsx
'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Edit, Clock } from 'lucide-react';
import NoticeTag from '@/components/notice/NoticeTag';
import NoticeHistoryModal from '@/components/notice/NoticeHistoryModal';
import { Notice } from '@/types/notice';

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const noticeId = params.id as string;
  const isAdmin = searchParams.get('admin') === 'true';
  const [notice, setNotice] = useState<Notice | null>(null);
  const [prevNotice, setPrevNotice] = useState<Notice | null>(null);
  const [nextNotice, setNextNotice] = useState<Notice | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    // localStorage에서 공지 데이터 가져오기
    const stored = localStorage.getItem('aidt_notices');
    if (!stored) {
      setNotice(null);
      return;
    }

    const notices: Notice[] = JSON.parse(stored);

    // 관리자는 모든 공지 볼 수 있음, 일반 사용자는 발행된 공지만
    const viewableNotices = isAdmin ? notices : notices.filter(n => n.status === 'published');

    // 현재 공지 찾기
    const currentNotice = viewableNotices.find(n => n.id === noticeId);
    setNotice(currentNotice || null);

    if (currentNotice) {
      // 조회수 증가
      const noticeIndex = notices.findIndex(n => n.id === noticeId);
      if (noticeIndex !== -1) {
        notices[noticeIndex].viewCount = (notices[noticeIndex].viewCount || 0) + 1;
        localStorage.setItem('aidt_notices', JSON.stringify(notices));
      }

      // 이전/다음 공지 찾기
      const currentIndex = viewableNotices.findIndex(n => n.id === noticeId);
      setPrevNotice(viewableNotices[currentIndex + 1] || null);
      setNextNotice(viewableNotices[currentIndex - 1] || null);
    }
  }, [noticeId, isAdmin]);

  if (!notice) {
    return <div className="max-w-3xl mx-auto px-8 py-20 text-center">공지를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-20">
      {/* 뒤로가기 및 수정 버튼 */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push(isAdmin ? '/admin/notice' : '/notice')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          목록으로
        </button>

        {isAdmin && (
          <button
            onClick={() => router.push(`/admin/notice/${noticeId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit className="w-4 h-4" />
            수정
          </button>
        )}
      </div>

      {/* 헤더 */}
      <div className="mb-8">
        <NoticeTag category={notice.category} />
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-4">
          {notice.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{(() => {
            const date = new Date(notice.createdAt);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}. ${month}. ${day}.`;
          })()}</span>
        </div>
      </div>

      {/* 구분선 */}
      <hr className="border-gray-200 mb-8" />

      {/* 관리자용 발행 정보 */}
      {isAdmin && (
        <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">발행 정보</h2>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                title="히스토리 보기"
              >
                <Clock className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-300">
              관리자 전용 - 사용자 화면에는 표시되지 않음
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 w-20">발행 유형:</span>
              <span className="text-sm text-gray-900 font-medium">
                {notice.publishAt ? '예약 발행' : '즉시 발행'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 w-20">발행 일시:</span>
              <span className="text-sm text-gray-900 font-medium">
                {(() => {
                  const publishDate = notice.publishAt || notice.createdAt;
                  const date = new Date(publishDate);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  return `${year}. ${month}. ${day}. ${hours}:${minutes}`;
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 w-20">상태:</span>
              <span className={`text-sm px-2 py-1 rounded ${
                notice.status === 'published' ? 'bg-green-100 text-green-800' :
                notice.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                notice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {notice.status === 'published' ? '발행됨' :
                 notice.status === 'scheduled' ? '예약됨' :
                 notice.status === 'draft' ? '임시저장' :
                 '만료됨'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 본문 */}
      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: notice.content }}
      />

      {/* 구분선 */}
      <hr className="border-gray-200 mb-8" />

      {/* 이전/다음 공지 */}
      <div className="flex justify-between items-center">
        {prevNotice ? (
          <button
            onClick={() => router.push(`/notice/${prevNotice.id}${isAdmin ? '?admin=true' : ''}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group"
          >
            <ChevronLeft className="w-5 h-5" />
            <div className="text-left">
              <div className="text-xs text-gray-400">이전글</div>
              <div className="text-sm font-medium group-hover:underline truncate max-w-xs">
                {prevNotice.title}
              </div>
            </div>
          </button>
        ) : (
          <div></div>
        )}

        {nextNotice ? (
          <button
            onClick={() => router.push(`/notice/${nextNotice.id}${isAdmin ? '?admin=true' : ''}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group"
          >
            <div className="text-right">
              <div className="text-xs text-gray-400">다음글</div>
              <div className="text-sm font-medium group-hover:underline truncate max-w-xs">
                {nextNotice.title}
              </div>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <div></div>
        )}
      </div>

      {/* 히스토리 모달 */}
      {isAdmin && (
        <NoticeHistoryModal
          history={notice.history || []}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
}
