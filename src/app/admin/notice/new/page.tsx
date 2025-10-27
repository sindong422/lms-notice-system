'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Eye } from 'lucide-react';
import { Notice, NoticeCategory, DismissDuration } from '@/types/notice';
import { dismissDurationLabels, priorityLabels, determineNoticeStatus } from '@/lib/utils';
import NoticePreviewModal from '@/components/notice/NoticePreviewModal';

const RichTextEditor = dynamic(() => import('@/components/editor/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="border border-gray-300 rounded-lg p-4 min-h-[300px]">로딩 중...</div>,
});

const categories = [
  { value: 'urgent', label: '긴급공지', emoji: '🔴' },
  { value: 'update', label: '업데이트', emoji: '⚙️' },
  { value: 'event', label: '이벤트', emoji: '🎁' },
  { value: 'announcement', label: '안내', emoji: '📌' },
];

const dismissDurations: DismissDuration[] = [
  '1hour',
  '3hours',
  '6hours',
  '12hours',
  '1day',
  '3days',
  '1week',
  'permanent',
];

export default function AdminNoticeNewPage() {
  const router = useRouter();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState({
    category: 'announcement' as NoticeCategory,
    title: '',
    content: '',
    isPinned: false,
    showInBanner: false,
    useTitleAsBannerContent: true,
    bannerContent: '',
    bannerStartDate: new Date().toISOString().slice(0, 16),
    bannerEndDate: '',
    bannerDismissDuration: '1day' as DismissDuration,
    showAsModal: false,
    useTitleAsModalContent: true,
    modalContent: '',
    useContentAsModalBody: true,
    modalBody: '',
    modalStartDate: new Date().toISOString().slice(0, 16),
    modalEndDate: '',
    modalDismissDuration: '1day' as DismissDuration,
    priority: 3,
    enableExpire: false,
    expireAt: '',
    enablePublishAt: false,
    publishAt: '',
  });

  // 저장 핸들러
  const handleSubmit = (status: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }
    if (!formData.content.trim()) {
      alert('내용을 입력해주세요');
      return;
    }

    const stored = localStorage.getItem('aidt_notices');
    const notices: Notice[] = stored ? JSON.parse(stored) : [];

    // 상태 자동 판별
    const finalStatus = determineNoticeStatus(
      formData.enablePublishAt ? formData.publishAt : undefined,
      formData.enableExpire ? formData.expireAt : undefined,
      status
    );

    const now = new Date().toISOString();

    const newNotice: Notice = {
      id: Date.now().toString(),
      category: formData.category,
      title: formData.title,
      content: formData.content,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      isPinned: formData.isPinned,
      showInBanner: formData.showInBanner,
      bannerContent: formData.showInBanner && !formData.useTitleAsBannerContent ? formData.bannerContent : undefined,
      bannerStartDate: formData.showInBanner ? formData.bannerStartDate : undefined,
      bannerEndDate: formData.showInBanner && formData.bannerEndDate ? formData.bannerEndDate : undefined,
      bannerDismissDuration: formData.showInBanner ? formData.bannerDismissDuration : undefined,
      showAsModal: formData.showAsModal,
      modalContent: formData.showAsModal && !formData.useTitleAsModalContent ? formData.modalContent : undefined,
      modalBody: formData.showAsModal && !formData.useContentAsModalBody ? formData.modalBody : undefined,
      modalStartDate: formData.showAsModal ? formData.modalStartDate : undefined,
      modalEndDate: formData.showAsModal && formData.modalEndDate ? formData.modalEndDate : undefined,
      modalDismissDuration: formData.showAsModal ? formData.modalDismissDuration : undefined,
      priority: formData.priority,
      expireAt: formData.enableExpire ? formData.expireAt : undefined,
      publishAt: formData.enablePublishAt ? formData.publishAt : undefined,
      author: {
        id: 'admin',
        name: '관리자',
      },
      status: finalStatus as any,
      history: [
        {
          action: 'created',
          timestamp: now,
          status: status === 'draft' ? 'draft' : (finalStatus === 'scheduled' ? 'scheduled' : 'draft'),
          note: status === 'draft' ? '임시저장됨' : undefined,
        },
        ...(finalStatus === 'published' ? [{
          action: 'published' as const,
          timestamp: new Date(Date.now() + 1).toISOString(),
          status: 'published' as any,
        }] : []),
      ],
    };

    notices.unshift(newNotice);
    localStorage.setItem('aidt_notices', JSON.stringify(notices));

    alert(status === 'draft' ? '임시저장되었습니다' : '등록되었습니다');
    router.push('/admin/notice');
  };

  // 미리보기
  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  // 미리보기용 공지 객체 생성
  const previewNotice: Partial<Notice> = {
    category: formData.category,
    title: formData.title || '제목을 입력하세요',
    content: formData.content || '내용을 입력하세요',
    isPinned: formData.isPinned,
    showInBanner: formData.showInBanner,
    bannerContent: formData.showInBanner && !formData.useTitleAsBannerContent ? formData.bannerContent : undefined,
    bannerDismissDuration: formData.bannerDismissDuration,
    showAsModal: formData.showAsModal,
    modalContent: formData.showAsModal && !formData.useTitleAsModalContent ? formData.modalContent : undefined,
    modalBody: formData.showAsModal && !formData.useContentAsModalBody ? formData.modalBody : undefined,
    modalDismissDuration: formData.modalDismissDuration,
    priority: formData.priority,
    createdAt: new Date().toISOString(),
    viewCount: 0,
    author: {
      id: 'admin',
      name: '관리자',
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-20">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/admin/notice')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold">공지사항 작성</h1>
      </div>

      {/* 폼 */}
      <div className="space-y-8">
        {/* 기본 정보 */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">기본 정보</h2>

          {/* 카테고리 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as NoticeCategory })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="공지사항 제목을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 우선순위 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              우선순위
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[1, 2, 3, 4, 5].map(p => (
                <option key={p} value={p}>
                  {priorityLabels[p]}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              여러 긴급 공지가 있을 때 우선순위가 높은(낮은 숫자) 공지가 먼저 표시됩니다
            </p>
          </div>
        </section>

        {/* 본문 */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">본문</h2>
          <RichTextEditor
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="공지사항 내용을 입력하세요"
          />
        </section>

        {/* 발행 설정 */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">발행 설정</h2>

          {/* 예약 발행 */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={formData.enablePublishAt}
                onChange={(e) => setFormData({ ...formData, enablePublishAt: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">예약 발행</div>
                <div className="text-sm text-gray-500">특정 일시에 자동으로 발행되도록 예약</div>
              </div>
            </label>

            {formData.enablePublishAt && (
              <div className="ml-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  발행 일시 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.publishAt}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      publishAt: e.target.value,
                      bannerStartDate: e.target.value,
                      modalStartDate: e.target.value,
                    });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  이 시간 이전에는 사용자에게 표시되지 않습니다
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* 자동 숨김 */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={formData.enableExpire}
                onChange={(e) => setFormData({ ...formData, enableExpire: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">자동 숨김</div>
                <div className="text-sm text-gray-500">특정 일시가 지나면 자동으로 숨김 처리</div>
              </div>
            </label>

            {formData.enableExpire && (
              <div className="ml-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  숨김 일시 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.expireAt}
                  onChange={(e) => setFormData({ ...formData, expireAt: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  이 시간 이후에는 자동으로 목록에서 숨겨집니다
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 노출 옵션 */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">노출 옵션</h2>

          {/* 상단 고정 */}
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-900">상단 고정</div>
              <div className="text-sm text-gray-500">공지사항 목록 최상단에 고정 표시</div>
            </div>
          </label>

          <div className="border-t border-gray-200 my-4"></div>

          {/* 헤더 배너 표시 */}
          <div className="mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showInBanner}
                onChange={(e) => setFormData({ ...formData, showInBanner: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
              />
              <div>
                <div className="font-medium text-gray-900 mb-1">헤더 배너 표시 (긴급 알림)</div>
                <div className="text-sm text-gray-500">
                  모든 페이지 상단에 배너로 표시됩니다. 사용자가 닫을 수 있습니다.
                </div>
              </div>
            </label>

            {formData.showInBanner && (
                <div className="ml-8 space-y-3">
                  {/* 배너 내용 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      배너 내용
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={formData.useTitleAsBannerContent}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData({
                            ...formData,
                            useTitleAsBannerContent: checked,
                            // 체크 해제 시 제목 내용을 배너 내용에 복사
                            bannerContent: !checked ? formData.title : formData.bannerContent
                          });
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">제목과 동일하게 사용</span>
                    </label>
                    <input
                      type="text"
                      value={formData.useTitleAsBannerContent ? formData.title : formData.bannerContent}
                      onChange={(e) => setFormData({ ...formData, bannerContent: e.target.value })}
                      placeholder="배너에 표시할 내용을 입력하세요"
                      disabled={formData.useTitleAsBannerContent}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formData.useTitleAsBannerContent ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      배너에 표시될 텍스트입니다. 제목보다 짧게 작성하는 것을 권장합니다.
                    </p>
                  </div>

                  {/* 표시 기간 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      배너 표시 기간
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="datetime-local"
                        value={formData.enablePublishAt && formData.publishAt ? formData.publishAt : formData.bannerStartDate}
                        onChange={(e) => setFormData({ ...formData, bannerStartDate: e.target.value })}
                        disabled={formData.enablePublishAt}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      <span className="text-gray-500">~</span>
                      <input
                        type="datetime-local"
                        value={formData.bannerEndDate}
                        onChange={(e) => setFormData({ ...formData, bannerEndDate: e.target.value })}
                        min={formData.bannerStartDate}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.enablePublishAt ? '예약 발행 일시와 연동되어 자동 설정됩니다' : '종료일시를 설정하지 않으면 무기한 표시됩니다'}
                    </p>
                  </div>

                  {/* 배너 닫기 유지 기간 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      배너 닫기 유지 기간
                    </label>
                    <select
                      value={formData.bannerDismissDuration}
                      onChange={(e) => setFormData({ ...formData, bannerDismissDuration: e.target.value as DismissDuration })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {dismissDurations.map(duration => (
                        <option key={duration} value={duration}>
                          {dismissDurationLabels[duration]}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      사용자가 배너를 닫았을 때 다시 표시하지 않을 기간
                    </p>
                  </div>
                </div>
              )}
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* 최초 접속 시 모달 표시 */}
          <div className="mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showAsModal}
                onChange={(e) => setFormData({ ...formData, showAsModal: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
              />
              <div>
                <div className="font-medium text-gray-900 mb-1">최초 접속 시 모달 표시</div>
                <div className="text-sm text-gray-500">
                  사용자가 최초 접속 시 팝업 모달로 표시됩니다. 사용자가 닫을 수 있습니다.
                </div>
              </div>
            </label>

            {formData.showAsModal && (
                <div className="ml-8 space-y-3">
                  {/* 모달 제목 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      모달 제목
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={formData.useTitleAsModalContent}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData({
                            ...formData,
                            useTitleAsModalContent: checked,
                            // 체크 해제 시 제목 내용을 모달 제목에 복사
                            modalContent: !checked ? formData.title : formData.modalContent
                          });
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">제목과 동일하게 사용</span>
                    </label>
                    <input
                      type="text"
                      value={formData.useTitleAsModalContent ? formData.title : formData.modalContent}
                      onChange={(e) => setFormData({ ...formData, modalContent: e.target.value })}
                      placeholder="모달에 표시할 제목을 입력하세요"
                      disabled={formData.useTitleAsModalContent}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formData.useTitleAsModalContent ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      모달에 표시될 제목입니다. 제목보다 짧게 작성하는 것을 권장합니다.
                    </p>
                  </div>

                  {/* 모달 본문 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      모달 본문
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={formData.useContentAsModalBody}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData({
                            ...formData,
                            useContentAsModalBody: checked,
                            // 체크 해제 시 본문 내용을 모달 본문에 복사
                            modalBody: !checked ? formData.content : formData.modalBody
                          });
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">본문과 동일하게 사용</span>
                    </label>
                    {formData.useContentAsModalBody ? (
                      <div className="border border-gray-300 rounded-lg p-4 min-h-[300px] bg-gray-100">
                        <div
                          className="prose max-w-none text-gray-500"
                          dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-gray-400">본문 내용이 여기에 표시됩니다...</p>' }}
                        />
                      </div>
                    ) : (
                      <RichTextEditor
                        content={formData.modalBody}
                        onChange={(content) => setFormData({ ...formData, modalBody: content })}
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      모달에 표시될 본문 내용입니다.
                    </p>
                  </div>

                  {/* 표시 기간 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      모달 표시 기간
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="datetime-local"
                        value={formData.enablePublishAt && formData.publishAt ? formData.publishAt : formData.modalStartDate}
                        onChange={(e) => setFormData({ ...formData, modalStartDate: e.target.value })}
                        disabled={formData.enablePublishAt}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      <span className="text-gray-500">~</span>
                      <input
                        type="datetime-local"
                        value={formData.modalEndDate}
                        onChange={(e) => setFormData({ ...formData, modalEndDate: e.target.value })}
                        min={formData.modalStartDate}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.enablePublishAt ? '예약 발행 일시와 연동되어 자동 설정됩니다' : '종료일시를 설정하지 않으면 무기한 표시됩니다'}
                    </p>
                  </div>

                  {/* 모달 닫기 유지 기간 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      모달 닫기 유지 기간
                    </label>
                    <select
                      value={formData.modalDismissDuration}
                      onChange={(e) => setFormData({ ...formData, modalDismissDuration: e.target.value as DismissDuration })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {dismissDurations.map(duration => (
                        <option key={duration} value={duration}>
                          {dismissDurationLabels[duration]}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      사용자가 모달을 닫았을 때 다시 표시하지 않을 기간
                    </p>
                  </div>
                </div>
              )}
          </div>
        </section>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            <Eye className="w-5 h-5" />
            미리보기
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/notice')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              취소
            </button>
            <button
              onClick={() => handleSubmit('draft')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              임시저장
            </button>
            <button
              onClick={() => handleSubmit('published')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              등록하기
            </button>
          </div>
        </div>
      </div>

      {/* 미리보기 모달 */}
      <NoticePreviewModal
        notice={previewNotice}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
