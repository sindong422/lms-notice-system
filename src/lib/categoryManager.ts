// lib/categoryManager.ts

export interface CustomCategory {
  id: string;
  label: string;
  emoji: string;
  color: string; // Tailwind color name (e.g., 'blue', 'green', 'purple')
  order: number;
}

const STORAGE_KEY = 'aidt_custom_categories';

// 기본 카테고리 정의
export const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: 'urgent', label: '긴급공지', emoji: '🔴', color: 'red', order: 0 },
  { id: 'update', label: '업데이트', emoji: '⚙️', color: 'yellow', order: 1 },
  { id: 'event', label: '이벤트', emoji: '🎁', color: 'pink', order: 2 },
  { id: 'announcement', label: '안내', emoji: '📌', color: 'blue', order: 3 },
];

// 레이블에서 자동으로 ID 생성
export function generateCategoryId(label: string, existingCategories: CustomCategory[]): string {
  // 타임스탬프 기반 고유 ID 생성
  const timestamp = Date.now();
  const baseId = `category_${timestamp}`;

  // 중복 체크 (거의 불가능하지만 안전을 위해)
  let id = baseId;
  let counter = 1;
  while (existingCategories.some(c => c.id === id)) {
    id = `${baseId}_${counter}`;
    counter++;
  }

  return id;
}

// 카테고리 목록 가져오기
export function getCategories(): CustomCategory[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }
  return DEFAULT_CATEGORIES;
}

// 카테고리 저장
export function saveCategories(categories: CustomCategory[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  // 같은 탭에서의 변경 감지를 위한 커스텀 이벤트 발생
  window.dispatchEvent(new Event('categoriesUpdated'));
}

// 카테고리 추가
export function addCategory(category: Omit<CustomCategory, 'order'>): CustomCategory[] {
  const categories = getCategories();
  const newCategory: CustomCategory = {
    ...category,
    order: categories.length,
  };
  const updated = [...categories, newCategory];
  saveCategories(updated);
  return updated;
}

// 카테고리 삭제
export function deleteCategory(categoryId: string): CustomCategory[] {
  const categories = getCategories();
  const updated = categories
    .filter(c => c.id !== categoryId)
    .map((c, index) => ({ ...c, order: index })); // 순서 재정렬
  saveCategories(updated);
  return updated;
}

// 카테고리 수정
export function updateCategory(categoryId: string, updates: Partial<Omit<CustomCategory, 'id' | 'order'>>): CustomCategory[] {
  const categories = getCategories();
  const updated = categories.map(c =>
    c.id === categoryId ? { ...c, ...updates } : c
  );
  saveCategories(updated);
  return updated;
}

// 카테고리 순서 변경
export function reorderCategories(categoryIds: string[]): CustomCategory[] {
  const categories = getCategories();
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const updated = categoryIds
    .map((id, index) => {
      const category = categoryMap.get(id);
      return category ? { ...category, order: index } : null;
    })
    .filter((c): c is CustomCategory => c !== null);

  saveCategories(updated);
  return updated;
}

// 카테고리 ID로 카테고리 정보 가져오기
export function getCategoryById(categoryId: string): CustomCategory | undefined {
  const categories = getCategories();
  return categories.find(c => c.id === categoryId);
}

// Tailwind 색상에 따른 클래스 이름 생성
export function getCategoryColorClasses(color: string, selected: boolean = false) {
  const baseColors = {
    red: selected
      ? 'bg-red-200 text-red-800 ring-2 ring-red-400'
      : 'bg-red-100 text-red-700 hover:bg-red-200',
    yellow: selected
      ? 'bg-yellow-200 text-yellow-900 ring-2 ring-yellow-400'
      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    pink: selected
      ? 'bg-pink-200 text-pink-800 ring-2 ring-pink-400'
      : 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    blue: selected
      ? 'bg-blue-200 text-blue-800 ring-2 ring-blue-400'
      : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    green: selected
      ? 'bg-green-200 text-green-800 ring-2 ring-green-400'
      : 'bg-green-100 text-green-700 hover:bg-green-200',
    purple: selected
      ? 'bg-purple-200 text-purple-800 ring-2 ring-purple-400'
      : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    indigo: selected
      ? 'bg-indigo-200 text-indigo-800 ring-2 ring-indigo-400'
      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    orange: selected
      ? 'bg-orange-200 text-orange-800 ring-2 ring-orange-400'
      : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    gray: selected
      ? 'bg-gray-200 text-gray-800 ring-2 ring-gray-400'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  };

  return baseColors[color as keyof typeof baseColors] || baseColors.gray;
}

// 배너용 색상 클래스 생성 (배경, 테두리, 텍스트)
export function getBannerColorClasses(color: string): string {
  const bannerColors = {
    red: 'bg-red-50 border-red-200 text-red-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    pink: 'bg-pink-50 border-pink-200 text-pink-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
  };

  return bannerColors[color as keyof typeof bannerColors] || bannerColors.blue;
}

// 배너 닫기 버튼용 색상 클래스 생성
export function getBannerButtonColorClasses(color: string): string {
  const buttonColors = {
    red: 'bg-white border-red-300 text-red-700 hover:bg-red-50',
    yellow: 'bg-white border-yellow-400 text-yellow-800 hover:bg-yellow-50',
    pink: 'bg-white border-pink-300 text-pink-700 hover:bg-pink-50',
    blue: 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50',
    green: 'bg-white border-green-300 text-green-700 hover:bg-green-50',
    purple: 'bg-white border-purple-300 text-purple-700 hover:bg-purple-50',
    indigo: 'bg-white border-indigo-300 text-indigo-700 hover:bg-indigo-50',
    orange: 'bg-white border-orange-300 text-orange-700 hover:bg-orange-50',
    gray: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
  };

  return buttonColors[color as keyof typeof buttonColors] || buttonColors.blue;
}
