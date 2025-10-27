'use client';

import { X } from 'lucide-react';
import { NoticeHistoryEntry } from '@/types/notice';

interface NoticeHistoryModalProps {
  history: NoticeHistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
}

const actionLabels: Record<string, string> = {
  created: '생성됨',
  published: '발행됨',
  updated: '수정됨',
  expired: '만료됨',
  reactivated: '재활성화됨',
};

const statusLabels: Record<string, string> = {
  draft: '임시저장',
  scheduled: '예약됨',
  published: '발행됨',
  expired: '만료됨',
};

export default function NoticeHistoryModal({ history, isOpen, onClose }: NoticeHistoryModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}. ${month}. ${day}. ${hours}:${minutes}`;
  };

  // 액션 우선순위 (같은 timestamp일 때 정렬 순서)
  const actionPriority: Record<string, number> = {
    created: 1,
    published: 2,
    updated: 3,
    reactivated: 4,
    expired: 5,
  };

  const sortedHistory = [...history].sort((a, b) => {
    const timeDiff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (timeDiff !== 0) return timeDiff;
    // 같은 timestamp면 액션 우선순위로 정렬
    return actionPriority[a.action] - actionPriority[b.action];
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">발행 히스토리</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              히스토리가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex gap-4 pb-4 border-b last:border-b-0"
                >
                  {/* 타임라인 도트 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      entry.action === 'published' ? 'bg-green-500' :
                      entry.action === 'expired' ? 'bg-red-500' :
                      entry.action === 'reactivated' ? 'bg-blue-500' :
                      entry.action === 'created' ? 'bg-purple-500' :
                      'bg-gray-400'
                    }`} />
                    {index < sortedHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2" />
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${
                        entry.action === 'published' ? 'text-green-700' :
                        entry.action === 'expired' ? 'text-red-700' :
                        entry.action === 'reactivated' ? 'text-blue-700' :
                        entry.action === 'created' ? 'text-purple-700' :
                        'text-gray-700'
                      }`}>
                        {actionLabels[entry.action]}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        entry.status === 'published' ? 'bg-green-100 text-green-800' :
                        entry.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        entry.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {statusLabels[entry.status]}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(entry.timestamp)}
                    </div>
                    {entry.note && (
                      <div className="text-sm text-gray-500 mt-1">
                        {entry.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
