// app/notice/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowLeft } from 'lucide-react';
import mockData from '@/data/mock-notices.json';
import CategoryTabs from '@/components/notice/CategoryTabs';
import SearchBar from '@/components/notice/SearchBar';
import NoticeCard from '@/components/notice/NoticeCard';
import EmptyState from '@/components/notice/EmptyState';
import { Notice } from '@/types/notice';

const extractPlainText = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export default function NoticeListPage() {
  const router = useRouter();
  const [category, setCategory] = useState<string>('all');
  const [searchInput, setSearchInput] = useState(''); // 사용자 입력값
  const [searchQuery, setSearchQuery] = useState(''); // 실제 검색어
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // LocalStorage에서 공지 로드
  useEffect(() => {
    const stored = localStorage.getItem('aidt_notices');
    if (stored) {
      setNotices(JSON.parse(stored));
    } else {
      // 최초 실행 시 mock 데이터 로드
      const mockNotices = mockData.notices as Notice[];
      localStorage.setItem('aidt_notices', JSON.stringify(mockNotices));
      setNotices(mockNotices);
    }
  }, []);

  // 필터링 로직
  const filteredNotices = useMemo(() => {
    const now = new Date();
    let result = notices.filter(notice => {
      // 임시저장은 표시 안함
      if (notice.status === 'draft') return false;

      // 예약된 공지는 발행 시간 전에는 표시 안함
      if (notice.publishAt && new Date(notice.publishAt) > now) return false;

      // 만료된 공지는 표시 안함
      if (notice.expireAt && new Date(notice.expireAt) < now) return false;

      return true;
    });

    // 카테고리 필터
    if (category !== 'all') {
      result = result.filter(n => n.category === category);
    }

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => {
        const titleMatch = n.title.toLowerCase().includes(query);
        const contentMatch = extractPlainText(n.content).toLowerCase().includes(query);
        return titleMatch || contentMatch;
      });
    }

    // 정렬: 고정 공지 먼저, 그 다음 최신순
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notices, category, searchQuery]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotices = filteredNotices.slice(startIndex, endIndex);
  const maxPageButtons = 5;
  // Calculate sequential page numbers, exposing up to five at a time
  const visiblePageNumbers = useMemo(() => {
    if (totalPages === 0) return [];
    const chunkStart = Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
    const chunkEnd = Math.min(chunkStart + maxPageButtons - 1, totalPages);
    return Array.from(
      { length: chunkEnd - chunkStart + 1 },
      (_, index) => chunkStart + index
    );
  }, [totalPages, currentPage]);

  // 검색 또는 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, category]);

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

  return (
    <div className="max-w-5xl mx-auto px-8 py-20">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="메인으로"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold">공지사항</h1>
        </div>
        <SearchBar value={searchInput} onChange={setSearchInput} onSearch={handleSearch} />
      </div>

      {/* 카테고리 탭 */}
      <CategoryTabs selected={category} onChange={setCategory} />

      {/* 공지 목록 */}
      <div className="mt-6 space-y-4">
        {filteredNotices.length > 0 ? (
          currentNotices.map(notice => (
            <NoticeCard key={notice.id} notice={notice} />
          ))
        ) : (
          <EmptyState type={searchQuery ? 'no-search-results' : 'no-notices'} />
        )}
      </div>

      {/* 페이지네이션 */}
      {filteredNotices.length > 0 && (
        <div className="mt-6 space-y-4">
          {/* 상단: 정보 및 페이지당 개수 선택 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              전체 {filteredNotices.length}개 중 {startIndex + 1}-{Math.min(endIndex, filteredNotices.length)}개 표시
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
              {/* 처음 페이지 */}
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="첫 페이지"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>

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

              {/* 페이지 번호 (연속된 5개씩 표시) */}
              <div className="flex items-center gap-1">
                {visiblePageNumbers.map(page => (
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
                ))}
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

              {/* 마지막 페이지 */}
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="마지막 페이지"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
