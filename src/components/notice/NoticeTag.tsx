// components/notice/NoticeTag.tsx
import { NoticeCategory } from '@/types/notice';

const tagStyles = {
  urgent: { bg: 'bg-red-100', text: 'text-red-700', label: '긴급공지', emoji: '🔴' },
  update: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '업데이트', emoji: '⚙️' },
  event: { bg: 'bg-pink-100', text: 'text-pink-700', label: '이벤트', emoji: '🎁' },
  announcement: { bg: 'bg-blue-100', text: 'text-blue-700', label: '안내', emoji: '📌' },
};

interface Props {
  category: NoticeCategory;
}

export default function NoticeTag({ category }: Props) {
  const style = tagStyles[category];

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span>{style.emoji}</span>
      {style.label}
    </span>
  );
}
