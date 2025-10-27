// components/notice/EmptyState.tsx
import { FileText, Search } from 'lucide-react';

interface Props {
  type: 'no-notices' | 'no-search-results';
}

export default function EmptyState({ type }: Props) {
  const config = {
    'no-notices': {
      Icon: FileText,
      title: '아직 등록된 공지가 없어요',
      description: '카테고리를 변경해보세요',
    },
    'no-search-results': {
      Icon: Search,
      title: '검색 결과가 없습니다',
      description: '다른 검색어로 시도해보세요',
    },
  };

  const { Icon, title, description } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
