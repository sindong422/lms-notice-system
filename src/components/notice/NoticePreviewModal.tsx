'use client';

import { useState } from 'react';
import { X, Megaphone, AlertCircle, FileText, ChevronLeft, ChevronRight, Pause } from 'lucide-react';
import { Notice } from '@/types/notice';
import NoticeTag from './NoticeTag';
import { dismissDurationLabels } from '@/lib/utils';

interface NoticePreviewModalProps {
  notice: Partial<Notice>;
  isOpen: boolean;
  onClose: () => void;
}

type PreviewTab = 'banner' | 'modal' | 'detail';

export default function NoticePreviewModal({ notice, isOpen, onClose }: NoticePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('banner');

  if (!isOpen) return null;

  const tabs = [
    { id: 'banner' as PreviewTab, label: '배너 미리보기', icon: Megaphone },
    { id: 'modal' as PreviewTab, label: '모달 미리보기', icon: AlertCircle },
    { id: 'detail' as PreviewTab, label: '상세 페이지', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">공지 미리보기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'banner' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                사용자가 페이지 상단에서 보게 될 배너 형태입니다. (showInBanner 옵션이 활성화된 경우)
              </p>
              {notice.showInBanner ? (
                <>
                  <div className={`border-b ${
                    notice.category === 'urgent' ? 'bg-red-50 border-red-200' :
                    notice.category === 'update' ? 'bg-yellow-50 border-yellow-200' :
                    notice.category === 'event' ? 'bg-pink-50 border-pink-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="max-w-7xl mx-auto px-4 py-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-lg flex-shrink-0">
                              {notice.category === 'urgent' ? '🔴' :
                               notice.category === 'update' ? '⚙️' :
                               notice.category === 'event' ? '🎁' :
                               '📌'}
                            </span>
                            <button className={`font-medium truncate hover:underline text-left ${
                              notice.category === 'urgent' ? 'text-red-900' :
                              notice.category === 'update' ? 'text-yellow-900' :
                              notice.category === 'event' ? 'text-pink-900' :
                              'text-blue-900'
                            }`}>
                              {notice.bannerContent || notice.title || '(제목 없음)'}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button className={`px-3 py-1 rounded text-sm transition-colors border ${
                              notice.category === 'urgent'
                                ? 'bg-white border-red-300 text-red-700 hover:bg-red-50'
                                : notice.category === 'update'
                                ? 'bg-white border-yellow-400 text-yellow-800 hover:bg-yellow-50'
                                : notice.category === 'event'
                                ? 'bg-white border-pink-300 text-pink-700 hover:bg-pink-50'
                                : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
                            }`}>
                              {dismissDurationLabels[notice.bannerDismissDuration || '1day']}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 여러 배너가 있는 경우 예시 */}
                  <div className="mt-8">
                    <p className="text-sm text-gray-600 mb-4">
                      여러 배너가 있는 경우 (화살표, 페이지 카운터, 자동 재생 제어 버튼이 표시됩니다)
                    </p>
                    <div className={`border-b ${
                      notice.category === 'urgent' ? 'bg-red-50 border-red-200' :
                      notice.category === 'update' ? 'bg-yellow-50 border-yellow-200' :
                      notice.category === 'event' ? 'bg-pink-50 border-pink-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-lg flex-shrink-0">
                                {notice.category === 'urgent' ? '🔴' :
                                 notice.category === 'update' ? '⚙️' :
                                 notice.category === 'event' ? '🎁' :
                                 '📌'}
                              </span>
                              <button className={`font-medium truncate hover:underline text-left ${
                                notice.category === 'urgent' ? 'text-red-900' :
                                notice.category === 'update' ? 'text-yellow-900' :
                                notice.category === 'event' ? 'text-pink-900' :
                                'text-blue-900'
                              }`}>
                                {notice.bannerContent || notice.title || '(제목 없음)'}
                              </button>

                              {/* 페이지 카운터 */}
                              <span className="text-xs opacity-60 flex-shrink-0 ml-2">
                                1 / 3
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* 이전 버튼 */}
                              <button className="p-1 hover:bg-black/10 rounded transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              {/* 자동 재생 제어 버튼 */}
                              <button className="p-1 hover:bg-black/10 rounded transition-colors">
                                <Pause className="w-4 h-4" />
                              </button>

                              {/* 다음 버튼 */}
                              <button className="p-1 hover:bg-black/10 rounded transition-colors">
                                <ChevronRight className="w-4 h-4" />
                              </button>

                              <button className={`px-3 py-1 rounded text-sm transition-colors border ${
                                notice.category === 'urgent'
                                  ? 'bg-white border-red-300 text-red-700 hover:bg-red-50'
                                  : notice.category === 'update'
                                  ? 'bg-white border-yellow-400 text-yellow-800 hover:bg-yellow-50'
                                  : notice.category === 'event'
                                  ? 'bg-white border-pink-300 text-pink-700 hover:bg-pink-50'
                                  : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
                              }`}>
                                {dismissDurationLabels[notice.bannerDismissDuration || '1day']}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  배너로 표시 옵션이 비활성화되어 있습니다.
                </div>
              )}
            </div>
          )}

          {activeTab === 'modal' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                사용자에게 팝업으로 표시될 모달 형태입니다. (showAsModal 옵션이 활성화된 경우)
              </p>
              {notice.showAsModal ? (
                <>
                  {/* 단일 모달 미리보기 */}
                  <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-auto overflow-hidden flex flex-col border-2 border-gray-300">
                    {/* 헤더 */}
                    <div className="flex items-start justify-between p-6 border-b border-gray-200 flex-shrink-0">
                      <div className="flex-1 min-w-0">
                        {notice.category && <NoticeTag category={notice.category} />}
                        <h2 className="text-xl font-bold mt-3 text-gray-900">
                          {notice.modalContent || notice.title || '(제목 없음)'}
                        </h2>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded flex-shrink-0 ml-2">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* 내용 */}
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <div
                        className="text-gray-700 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: notice.modalBody || notice.content || '(내용 없음)'
                        }}
                      />
                    </div>

                    {/* 액션 */}
                    <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
                      <button className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm">
                        {dismissDurationLabels[notice.modalDismissDuration || '1day']}
                      </button>
                      <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                        자세히 보기
                      </button>
                    </div>
                  </div>

                  {/* 여러 모달이 있는 경우 예시 */}
                  <div className="mt-8">
                    <p className="text-sm text-gray-600 mb-4">
                      여러 모달이 있는 경우 (캐러셀 네비게이션이 표시됩니다)
                    </p>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-auto overflow-hidden flex flex-col border-2 border-gray-300">
                      {/* 헤더 */}
                      <div className="flex items-start justify-between p-6 border-b border-gray-200 flex-shrink-0">
                        <div className="flex-1 min-w-0">
                          {notice.category && <NoticeTag category={notice.category} />}
                          <h2 className="text-xl font-bold mt-3 text-gray-900">
                            {notice.modalContent || notice.title || '(제목 없음)'}
                          </h2>
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded flex-shrink-0 ml-2">
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      {/* 내용 */}
                      <div className="p-6 max-h-96 overflow-y-auto">
                        <div
                          className="text-gray-700 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: notice.modalBody || notice.content || '(내용 없음)'
                          }}
                        />
                      </div>

                      {/* 캐러셀 네비게이션 */}
                      <div className="flex items-center justify-center gap-4 px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <button className="p-2 hover:bg-gray-200 rounded-full transition">
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* 도트 인디케이터 */}
                        <div className="flex items-center gap-2">
                          <button className="w-4 h-2 rounded-full bg-blue-600" />
                          <button className="w-2 h-2 rounded-full bg-gray-300" />
                          <button className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>

                        <button className="p-2 hover:bg-gray-200 rounded-full transition">
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="text-sm text-gray-600 ml-2">
                          1 / 3
                        </div>
                      </div>

                      {/* 액션 */}
                      <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
                        <button className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm">
                          {dismissDurationLabels[notice.modalDismissDuration || '1day']}
                        </button>
                        <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                          자세히 보기
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  모달로 표시 옵션이 비활성화되어 있습니다.
                </div>
              )}
            </div>
          )}

          {activeTab === 'detail' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                공지 상세 페이지에서 보여질 내용입니다.
              </p>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                {/* Header */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {notice.category && <NoticeTag category={notice.category} />}
                    {notice.isPinned && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                        📌 고정
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {notice.title || '(제목 없음)'}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>작성자: {typeof notice.author === 'string' ? notice.author : notice.author?.name || '관리자'}</span>
                    <span>•</span>
                    <span>작성일: {notice.createdAt ? (() => {
                      const date = new Date(notice.createdAt);
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}. ${month}. ${day}.`;
                    })() : '오늘'}</span>
                    <span>•</span>
                    <span>조회수: {notice.viewCount || 0}</span>
                  </div>
                </div>

                {/* Content */}
                <div
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: notice.content || '(내용 없음)'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
