// components/notice/CategoryTabs.tsx
'use client';

import { useState, useEffect } from 'react';
import { getCategories, CustomCategory } from '@/lib/categoryManager';

interface Props {
  selected: string;
  onChange: (category: string) => void;
}

export default function CategoryTabs({ selected, onChange }: Props) {
  const [categories, setCategories] = useState<CustomCategory[]>([]);

  useEffect(() => {
    // 초기 로드
    setCategories(getCategories());

    // localStorage 변경 감지
    const handleStorageChange = () => {
      setCategories(getCategories());
    };

    window.addEventListener('storage', handleStorageChange);

    // 같은 탭에서의 변경도 감지하기 위한 커스텀 이벤트
    window.addEventListener('categoriesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('categoriesUpdated', handleStorageChange);
    };
  }, []);

  const allCategories = [
    { id: 'all', label: '전체', emoji: '', color: 'gray', order: -1 },
    ...categories,
  ];

  return (
    <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
      {allCategories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap
            ${selected === cat.id
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          {cat.emoji && <span>{cat.emoji} </span>}
          {cat.label}
        </button>
      ))}
    </div>
  );
}
