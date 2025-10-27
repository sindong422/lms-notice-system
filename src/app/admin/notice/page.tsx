'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff, Settings, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Notice } from '@/types/notice';
import NoticeTag from '@/components/notice/NoticeTag';
import { priorityLabels, noticeStatusLabels, determineNoticeStatus } from '@/lib/utils';
import CategorySettingsModal from '@/components/admin/CategorySettingsModal';
import { getCategories, getCategoryColorClasses } from '@/lib/categoryManager';

export default function AdminNoticeListPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchInput, setSearchInput] = useState(''); // 사용자 입력값
  const [searchQuery, setSearchQuery] = useState(''); // 실제 검색어
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showBannerOnly, setShowBannerOnly] = useState(false);
  const [showModalOnly, setShowModalOnly] = useState(false);
  const [categorySettingsOpen, setCategorySettingsOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState(getCategories());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // No. 컬럼 정렬 순서

  // 로컬스토리지에서 데이터 로드
  useEffect(() => {
    const stored = localStorage.getItem('aidt_notices');
    if (stored) {
      setNotices(JSON.parse(stored) as Notice[]);
    } else {
      // 최초 실행 시 mock 데이터 로드
      import('@/data/mock-notices.json').then(data => {
        const notices = data.notices as Notice[];
        localStorage.setItem('aidt_notices', JSON.stringify(notices));
        setNotices(notices);
      });
    }
  }, []);

  // 삭제 핸들러
  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const updated = notices.filter(n => n.id !== id);
    setNotices(updated);
    localStorage.setItem('aidt_notices', JSON.stringify(updated));
    setCurrentPage(1); // 삭제 후 첫 페이지로 이동
  };

  // 숨김 처리 핸들러
  const handleExpire = (id: string) => {
    if (!confirm('이 공지사항을 숨김 처리하겠습니까?\n숨김 처리된 공지는 사용자 화면에서 표시되지 않습니다.')) return;

    const now = new Date().toISOString();
    const updated = notices.map(n => {
      if (n.id === id) {
        const history = n.history || [];
        history.push({
          action: 'expired',
          timestamp: now,
          status: 'expired',
          note: '관리자가 수동으로 숨김 처리함',
        });

        return {
          ...n,
          status: 'expired' as const,
          expireAt: now, // 현재 시간으로 만료 시간 설정
          updatedAt: now,
          history,
        };
      }
      return n;
    });

    setNotices(updated);
    localStorage.setItem('aidt_notices', JSON.stringify(updated));
  };

  // 노출 처리 핸들러
  const handleReactivate = (id: string) => {
    if (!confirm('이 공지사항을 노출 처리하겠습니까?')) return;

    const now = new Date().toISOString();
    const updated = notices.map(n => {
      if (n.id === id) {
        const history = n.history || [];
        history.push({
          action: 'reactivated',
          timestamp: now,
          status: 'published',
          note: '관리자가 재활성화함',
        });

        return {
          ...n,
          status: 'published' as const,
          expireAt: undefined, // 만료 시간 제거
          updatedAt: now,
          history,
        };
      }
      return n;
    });

    setNotices(updated);
    localStorage.setItem('aidt_notices', JSON.stringify(updated));
  };

  // 상태 필터 토글 핸들러
  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // 카테고리 필터 토글 핸들러
  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // 검색 및 필터링
  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      // 제목 검색
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase());

      // 카테고리 필터
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(n.category);

      // 상태 필터
      const currentStatus = determineNoticeStatus(n.publishAt, n.expireAt, n.status);
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(currentStatus);

      // 고정 필터
      const matchesPinned = !showPinnedOnly || n.isPinned;

      // 배너 필터
      const matchesBanner = !showBannerOnly || n.showInBanner;

      // 모달 필터
      const matchesModal = !showModalOnly || n.showAsModal;

      return matchesSearch && matchesCategory && matchesStatus && matchesPinned && matchesBanner && matchesModal;
    });
  }, [notices, searchQuery, selectedCategories, selectedStatuses, showPinnedOnly, showBannerOnly, showModalOnly]);

  // 각 게시물의 실제 번호 계산 (생성일 오름차순 기준)
  const noticesWithNumber = useMemo(() => {
    const sorted = [...filteredNotices].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const numberMap = new Map<string, number>();
    sorted.forEach((notice, index) => {
      numberMap.set(notice.id, index + 1);
    });

    const withNumbers = filteredNotices.map(notice => ({
      ...notice,
      displayNumber: numberMap.get(notice.id) || 0,
      currentStatus: determineNoticeStatus(notice.publishAt, notice.expireAt, notice.status)
    }));

    // sortOrder에 따라 정렬
    return withNumbers.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.displayNumber - b.displayNumber;
      } else {
        return b.displayNumber - a.displayNumber;
      }
    });
  }, [filteredNotices, sortOrder]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(noticesWithNumber.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotices = noticesWithNumber.slice(startIndex, endIndex);

  // 검색 또는 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, selectedStatuses, showPinnedOnly, showBannerOnly, showModalOnly, sortOrder]);

  // 페이지당 아이템 수 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // 페이지 변경 핸들러
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // 검색 핸들러
  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  // Enter 키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-20">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">공지사항 관리</h1>
        <button
          onClick={() => router.push('/admin/notice/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          새 공지 작성
        </button>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <div className="relative w-80 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="제목 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            검색
          </button>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 self-center mr-2">카테고리:</span>

          {customCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleCategoryFilter(category.id)}
              className={`px-3 py-1.5 text-xs rounded-full transition flex items-center gap-1 ${
                getCategoryColorClasses(category.color, selectedCategories.includes(category.id))
              }`}
            >
              <span>{category.emoji}</span>
              {category.label}
            </button>
          ))}

          {/* 구분선 */}
          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* 설정 버튼 */}
          <button
            onClick={() => setCategorySettingsOpen(true)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition border border-dashed border-gray-300 hover:border-blue-400"
            title="카테고리 설정"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 self-center mr-2">상태 필터:</span>

          {/* 주요 상태 필터 */}
          <button
            onClick={() => toggleStatusFilter('draft')}
            className={`px-3 py-1.5 text-xs rounded-md transition ${
              selectedStatuses.includes('draft')
                ? 'bg-gray-200 text-gray-800 ring-2 ring-gray-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            임시저장
          </button>

          <button
            onClick={() => toggleStatusFilter('scheduled')}
            className={`px-3 py-1.5 text-xs rounded-md transition ${
              selectedStatuses.includes('scheduled')
                ? 'bg-blue-200 text-blue-800 ring-2 ring-blue-400'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            예약됨
          </button>

          <button
            onClick={() => toggleStatusFilter('published')}
            className={`px-3 py-1.5 text-xs rounded-md transition ${
              selectedStatuses.includes('published')
                ? 'bg-green-200 text-green-800 ring-2 ring-green-400'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            발행됨
          </button>

          <button
            onClick={() => toggleStatusFilter('expired')}
            className={`px-3 py-1.5 text-xs rounded-md transition ${
              selectedStatuses.includes('expired')
                ? 'bg-orange-200 text-orange-800 ring-2 ring-orange-400'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            숨겨짐
          </button>

          {/* 추가 옵션 필터 */}
          <div className="w-px h-6 bg-gray-300 self-center mx-1"></div>

          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className={`px-3 py-1.5 text-xs rounded-md transition ${
              showPinnedOnly
                ? 'bg-yellow-200 text-yellow-800 ring-2 ring-yellow-400'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            고정
          </button>

          <button
            onClick={() => setShowBannerOnly(!showBannerOnly)}
            className={`px-3 py-1.5 text-xs rounded-md transition ${
              showBannerOnly
                ? 'bg-red-200 text-red-800 ring-2 ring-red-400'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            배너
          </button>

          <button
            onClick={() => setShowModalOnly(!showModalOnly)}
            className={`px-3 py-1.5 text-xs rounded-md transition ${
              showModalOnly
                ? 'bg-purple-200 text-purple-800 ring-2 ring-purple-400'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            모달
          </button>

          {/* 필터 초기화 버튼 */}
          {(selectedCategories.length > 0 || selectedStatuses.length > 0 || showPinnedOnly || showBannerOnly || showModalOnly) && (
            <>
              <div className="w-px h-6 bg-gray-300 self-center mx-1"></div>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedStatuses([]);
                  setShowPinnedOnly(false);
                  setShowBannerOnly(false);
                  setShowModalOnly(false);
                }}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 underline"
              >
                전체 초기화
              </button>
            </>
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  title={sortOrder === 'asc' ? '내림차순으로 정렬' : '오름차순으로 정렬'}
                >
                  No.
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">카테고리</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">제목</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">우선순위</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">상태</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">조회수</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">작성일</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentNotices.map((notice) => (
              <tr key={notice.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{notice.displayNumber}</td>
                <td className="px-4 py-3">
                  <NoticeTag category={notice.category} />
                </td>
                <td className="px-4 py-3 text-sm font-medium max-w-xs truncate">
                  <button
                    onClick={() => router.push(`/notice/${notice.id}?admin=true`)}
                    className="text-gray-900 hover:text-blue-600 hover:underline text-left"
                  >
                    {notice.title}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {priorityLabels[notice.priority || 3]}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      notice.currentStatus === 'draft' ? 'bg-gray-100 text-gray-700' :
                      notice.currentStatus === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      notice.currentStatus === 'published' ? 'bg-green-100 text-green-700' :
                      notice.currentStatus === 'expired' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {noticeStatusLabels[notice.currentStatus]}
                    </span>
                    {notice.isPinned && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                        고정
                      </span>
                    )}
                    {notice.showInBanner && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        배너
                      </span>
                    )}
                    {notice.showAsModal && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                        모달
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {notice.viewCount}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {(() => {
                    const date = new Date(notice.createdAt);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}. ${month}. ${day}.`;
                  })()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {/* 수정 버튼 */}
                    <button
                      onClick={() => router.push(`/admin/notice/${notice.id}/edit`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="수정"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* 숨김/노출 버튼 */}
                    {notice.currentStatus === 'expired' ? (
                      <button
                        onClick={() => handleReactivate(notice.id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded transition"
                        title="노출"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    ) : (notice.currentStatus === 'published' || notice.currentStatus === 'scheduled') && (
                      <button
                        onClick={() => handleExpire(notice.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                        title="숨김"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {noticesWithNumber.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            검색 결과가 없습니다
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {noticesWithNumber.length > 0 && (
        <div className="mt-6 space-y-4">
          {/* 상단: 정보 및 페이지당 개수 선택 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              전체 {noticesWithNumber.length}개 중 {startIndex + 1}-{Math.min(endIndex, noticesWithNumber.length)}개 표시
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                페이지당 표시:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10개</option>
                <option value={20}>20개</option>
                <option value={30}>30개</option>
              </select>
            </div>
          </div>

          {/* 하단: 페이지네이션 버튼 (가운데 정렬) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {/* 이전 페이지 */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* 페이지 번호 */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // 현재 페이지 주변 페이지만 표시
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* 다음 페이지 */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 카테고리 설정 모달 */}
      <CategorySettingsModal
        isOpen={categorySettingsOpen}
        onClose={() => setCategorySettingsOpen(false)}
        onUpdate={() => setCustomCategories(getCategories())}
      />
    </div>
  );
}
