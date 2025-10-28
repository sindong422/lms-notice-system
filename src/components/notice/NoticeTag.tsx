// components/notice/NoticeTag.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_CATEGORIES, getCategories, CustomCategory } from '@/lib/categoryManager';
import type { Notice } from '@/types/notice';

interface Props {
  category: Notice['category'] | string;
}

const colorClassMap: Record<string, { bg: string; text: string }> = {
  red: { bg: 'bg-red-100', text: 'text-red-700' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
  green: { bg: 'bg-green-100', text: 'text-green-700' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export default function NoticeTag({ category }: Props) {
  const fallbackCategory = useMemo<CustomCategory | undefined>(
    () => DEFAULT_CATEGORIES.find((c) => c.id === category),
    [category]
  );
  const [categoryInfo, setCategoryInfo] = useState<CustomCategory | undefined>(fallbackCategory);

  useEffect(() => {
    const loadCategory = () => {
      const categories = getCategories();
      const resolved = categories.find((c) => c.id === category) ?? DEFAULT_CATEGORIES.find((c) => c.id === category);
      setCategoryInfo(resolved);
    };

    loadCategory();
    window.addEventListener('storage', loadCategory);
    window.addEventListener('categoriesUpdated', loadCategory);
    return () => {
      window.removeEventListener('storage', loadCategory);
      window.removeEventListener('categoriesUpdated', loadCategory);
    };
  }, [category]);

  if (!categoryInfo) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        <span>📌</span>
        {category}
      </span>
    );
  }

  const { emoji, label, color } = categoryInfo;
  const colorClass = colorClassMap[color] ?? colorClassMap.gray;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colorClass.bg} ${colorClass.text}`}>
      <span>{emoji}</span>
      {label}
    </span>
  );
}
