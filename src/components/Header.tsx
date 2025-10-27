'use client';

import { useRouter } from 'next/navigation';
import { Megaphone, Bell, Clock, MessageCircle, Settings, Globe } from 'lucide-react';

export default function Header() {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 좌측: 로고/타이틀 */}
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-md hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900">초등 수학 5-2</h1>
            <button className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200">
              홈
            </button>
          </div>

          {/* 우측: 아이콘 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 공지사항 아이콘 (확성기) */}
            <button
              onClick={() => router.push('/notice')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              title="공지사항"
            >
              <Megaphone className="w-5 h-5 text-gray-600" />
              {/* 새 공지사항이 있을 경우 빨간 점 표시 */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* 시계 아이콘 */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="시간"
            >
              <Clock className="w-5 h-5 text-gray-600" />
            </button>

            {/* 채팅 아이콘 */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="채팅"
            >
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </button>

            {/* 알림 아이콘 (종) */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              title="알림"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </button>

            {/* 설정 아이콘 */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="설정"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            {/* 언어 변경 */}
            <button
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="언어 변경"
            >
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">언어 변경</span>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
