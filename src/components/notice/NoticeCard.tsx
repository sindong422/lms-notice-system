// components/notice/NoticeCard.tsx
'use client';

import Link from 'next/link';
import { Pin } from 'lucide-react';
import { Notice } from '@/types/notice';
import NoticeTag from './NoticeTag';
import { isRead } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface Props {
  notice: Notice;
}

export default function NoticeCard({ notice }: Props) {
  const [read, setRead] = useState(false);

  useEffect(() => {
    setRead(isRead(notice.id));
  }, [notice.id]);

  const isNew = () => {
    const daysDiff = Math.floor(
      (Date.now() - new Date(notice.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff <= 7;
  };

  return (
    <Link href={`/notice/${notice.id}`}>
      <div className={`
        p-6 rounded-lg border cursor-pointer transition-all duration-150
        ${read && notice.isPinned
          ? 'bg-yellow-50/60 border-yellow-200/60 hover:bg-yellow-100/60 hover:border-yellow-300/60'
          : read && !notice.isPinned
            ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
            : notice.isPinned
              ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300'
              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }
        hover:scale-[1.01]
      `}>
        <div className="flex items-start gap-3">
          {/* 고정 아이콘 */}
          {notice.isPinned && (
            <Pin className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            {/* 카테고리 + NEW + 읽음 */}
            <div className="flex items-center gap-2 mb-2">
              <NoticeTag category={notice.category} />
              {isNew() && !read && (
                <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded">
                  NEW
                </span>
              )}
              {read && (
                <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-200 rounded">
                  읽음
                </span>
              )}
            </div>

            {/* 제목 */}
            <h3 className={`text-lg font-semibold mb-2 truncate ${
              read ? 'text-gray-600' : 'text-gray-900'
            }`}>
              {notice.title}
            </h3>

            {/* 메타 정보 */}
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
        </div>
      </div>
    </Link>
  );
}
