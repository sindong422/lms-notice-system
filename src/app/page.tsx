'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Home, BookOpen, TrendingUp, FileText, BarChart3,
  Users, Settings as SettingsIcon, MessageSquare, Radio
} from 'lucide-react';

export default function MainPage() {
  const router = useRouter();

  const menuItems = [
    { icon: Home, label: '홈', active: true },
    { icon: BookOpen, label: '우리 반 수업', active: false },
    { icon: TrendingUp, label: '맞춤 학습', active: false },
    { icon: FileText, label: '과제', active: false },
    { icon: BarChart3, label: '평가', active: false },
    { icon: BarChart3, label: '학습 분석', active: false },
    { icon: Users, label: '학급 관리', active: false },
    { icon: MessageSquare, label: '학급 게시판', active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

      <div className="flex">
        {/* 좌측 사이드바 */}
        <aside className="w-56 bg-white border-r border-gray-200 min-h-screen p-4">
          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-yellow-50 text-yellow-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 하단 메뉴 */}
          <div className="mt-auto pt-8 space-y-2">
            <button className="w-full flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Radio className="w-5 h-5" />
              <span>학생 관계 보기</span>
            </button>

            <div className="space-y-1 pt-4 border-t border-gray-200">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                환경 설정
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                이용 안내
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                교과서 나가기
              </button>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-8">
          {/* 환영 배너 */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                새로운 시작, 배움에도 봄이 왔어요!
              </h2>
            </div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-4">
              <div className="w-24 h-24 bg-pink-400 rounded-2xl opacity-80"></div>
              <div className="w-20 h-20 bg-blue-400 rounded-xl opacity-80"></div>
              <div className="w-16 h-16 bg-yellow-400 rounded-lg opacity-80"></div>
            </div>
          </div>

          {/* 최근 수업 섹션 */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900">최근 수업</h3>
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>준비 학습</option>
                <option>복습</option>
                <option>평가</option>
              </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center py-12">
                <p className="text-gray-500 mb-6">수학을 시작해요</p>
                <button
                  onClick={() => router.push('/notice')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  교과서 수업
                </button>
              </div>
            </div>
          </section>

          {/* 퀵 메뉴 */}
          <section className="mb-8">
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: '수업 계구성', icon: '🎯' },
                { label: '학습 분석', icon: '📊' },
                { label: '창친/배지 현황', icon: '🏆' },
                { label: '학습 챌린지 현황', icon: '📈' },
                { label: '성찰 일지', icon: '📝' },
              ].map((item, index) => (
                <button
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                </button>
              ))}
            </div>
          </section>

          {/* 하단 섹션 */}
          <div className="grid grid-cols-2 gap-8">
            {/* 내 할 일 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-gray-900">내 할 일</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    과제
                  </button>
                  <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    알림
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-500">아직 진행 중인 과제가 없어요.</p>
                  <button className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                    과제 출제
                  </button>
                </div>
              </div>
            </section>

            {/* 실시간 학급 운영 */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">실시간 학급 운영</h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-2">학급 정서</p>
                      <div className="flex gap-2">
                        {['😊', '😐', '😢', '😠', '😴'].map((emoji, index) => (
                          <div key={index} className="text-center">
                            <div className="text-2xl">{emoji}</div>
                            <div className="text-xs text-gray-500">0명</div>
                          </div>
                        ))}
                        <div className="text-center">
                          <div className="text-2xl">😶</div>
                          <div className="text-xs text-gray-500">30명</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                  자세히 보기
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
