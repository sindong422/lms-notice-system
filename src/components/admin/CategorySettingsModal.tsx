'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { CustomCategory, getCategories, addCategory, deleteCategory, updateCategory, generateCategoryId } from '@/lib/categoryManager';
import { Notice } from '@/types/notice';

interface CategorySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EMOJI_OPTIONS = ['🔴', '⚙️', '🎁', '📌', '📢', '🎉', '⚡', '🔔', '💡', '🌟', '🚀', '📝', '✨', '🎯', '📣'];
const COLOR_OPTIONS = [
  { name: 'red', label: '빨강' },
  { name: 'yellow', label: '노랑' },
  { name: 'pink', label: '분홍' },
  { name: 'blue', label: '파랑' },
  { name: 'green', label: '초록' },
  { name: 'purple', label: '보라' },
  { name: 'indigo', label: '남색' },
  { name: 'orange', label: '주황' },
  { name: 'gray', label: '회색' },
];

export default function CategorySettingsModal({ isOpen, onClose, onUpdate }: CategorySettingsModalProps) {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    label: '',
    emoji: '📌',
    color: 'blue',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CustomCategory | null>(null);
  const [replacementCategoryId, setReplacementCategoryId] = useState<string>('');
  const [affectedNoticesCount, setAffectedNoticesCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCategories(getCategories());
      setShowAddForm(false);
      setEditingId(null);
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (!newCategory.label) {
      alert('레이블을 입력해주세요.');
      return;
    }

    // 레이블에서 자동으로 ID 생성
    const id = generateCategoryId(newCategory.label, categories);

    addCategory({ id, ...newCategory });
    setCategories(getCategories());
    setNewCategory({ label: '', emoji: '📌', color: 'blue' });
    setShowAddForm(false);
    onUpdate();
  };

  const handleDelete = (categoryId: string) => {
    // 최소 1개의 카테고리는 유지
    if (categories.length <= 1) {
      alert('최소 1개의 카테고리는 유지해야 합니다.');
      return;
    }

    // 해당 카테고리를 사용하는 공지 수 확인
    const stored = localStorage.getItem('aidt_notices');
    if (stored) {
      const notices: Notice[] = JSON.parse(stored);
      const affectedNotices = notices.filter(n => n.category === categoryId);

      if (affectedNotices.length > 0) {
        // 공지가 있으면 대체 카테고리 선택 UI 표시
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          setDeletingCategory(category);
          setAffectedNoticesCount(affectedNotices.length);
          // 첫 번째 다른 카테고리를 기본값으로 설정
          const otherCategory = categories.find(c => c.id !== categoryId);
          if (otherCategory) {
            setReplacementCategoryId(otherCategory.id);
          }
        }
        return;
      }
    }

    // 공지가 없으면 바로 삭제
    if (!confirm('이 카테고리를 삭제하시겠습니까?')) {
      return;
    }

    deleteCategory(categoryId);
    setCategories(getCategories());
    onUpdate();
  };

  const confirmDelete = () => {
    if (!deletingCategory) return;

    // 해당 카테고리를 사용하는 모든 공지의 카테고리를 변경
    const stored = localStorage.getItem('aidt_notices');
    if (stored) {
      const notices: Notice[] = JSON.parse(stored);
      const updatedNotices = notices.map(n =>
        n.category === deletingCategory.id
          ? { ...n, category: replacementCategoryId as any, updatedAt: new Date().toISOString() }
          : n
      );
      localStorage.setItem('aidt_notices', JSON.stringify(updatedNotices));
    }

    // 카테고리 삭제
    deleteCategory(deletingCategory.id);
    setCategories(getCategories());
    setDeletingCategory(null);
    setReplacementCategoryId('');
    setAffectedNoticesCount(0);
    onUpdate();
  };

  const cancelDelete = () => {
    setDeletingCategory(null);
    setReplacementCategoryId('');
    setAffectedNoticesCount(0);
  };

  const handleUpdate = (categoryId: string, updates: Partial<CustomCategory>) => {
    updateCategory(categoryId, updates);
    setCategories(getCategories());
    setEditingId(null);
    onUpdate();
  };

  const handleClose = () => {
    setShowAddForm(false);
    setEditingId(null);
    setDeletingCategory(null);
    setReplacementCategoryId('');
    setAffectedNoticesCount(0);
    setNewCategory({ label: '', emoji: '📌', color: 'blue' });
    onClose();
  };

  if (!isOpen) return null;

  // 대체 카테고리 선택 모달이 열려있으면
  if (deletingCategory) {
    const availableCategories = categories.filter(c => c.id !== deletingCategory.id);

    return (
      <>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50 z-50" />

        {/* 대체 카테고리 선택 모달 */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold">카테고리 삭제 확인</h2>
              </div>
              <button
                onClick={cancelDelete}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-orange-700">'{deletingCategory.emoji} {deletingCategory.label}'</span> 카테고리를 사용하는 공지사항이 <span className="font-semibold text-orange-700">{affectedNoticesCount}개</span> 있습니다.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  해당 공지들의 카테고리를 다른 카테고리로 변경한 후 삭제됩니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대체 카테고리 선택
                </label>
                <select
                  value={replacementCategoryId}
                  onChange={(e) => setReplacementCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.emoji} {category.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {affectedNoticesCount}개의 공지가 선택한 카테고리로 변경됩니다.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                disabled={!replacementCategoryId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                삭제 및 변경
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">카테고리 관리</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* 현재 카테고리 목록 */}
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                {editingId === category.id ? (
                  // 편집 모드
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        카테고리 이름
                      </label>
                      <input
                        type="text"
                        value={category.label}
                        onChange={(e) => {
                          const updated = categories.map(c =>
                            c.id === category.id ? { ...c, label: e.target.value } : c
                          );
                          setCategories(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          이모지
                        </label>
                        <select
                          value={category.emoji}
                          onChange={(e) => {
                            const updated = categories.map(c =>
                              c.id === category.id ? { ...c, emoji: e.target.value } : c
                            );
                            setCategories(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          {EMOJI_OPTIONS.map(emoji => (
                            <option key={emoji} value={emoji}>{emoji}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          색상
                        </label>
                        <select
                          value={category.color}
                          onChange={(e) => {
                            const updated = categories.map(c =>
                              c.id === category.id ? { ...c, color: e.target.value } : c
                            );
                            setCategories(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          {COLOR_OPTIONS.map(color => (
                            <option key={color.name} value={color.name}>{color.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleUpdate(category.id, {
                          label: category.label,
                          emoji: category.emoji,
                          color: category.color,
                        })}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  // 표시 모드
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.emoji}</span>
                      <div className="font-medium">{category.label}</div>
                      <span className={`px-3 py-1 text-xs rounded-full bg-${category.color}-100 text-${category.color}-700`}>
                        {COLOR_OPTIONS.find(c => c.name === category.color)?.label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(category.id)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={categories.length <= 1}
                        className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        title={categories.length <= 1 ? '최소 1개의 카테고리는 유지해야 합니다' : '카테고리 삭제'}
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 카테고리 추가 폼 */}
            {showAddForm ? (
              <div className="border-2 border-blue-300 border-dashed rounded-lg p-4 space-y-3">
                <h3 className="font-medium">새 카테고리 추가</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리 이름
                  </label>
                  <input
                    type="text"
                    value={newCategory.label}
                    onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                    placeholder="예: 공지, 알림, 안내사항 등"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ID는 자동으로 생성됩니다
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이모지
                    </label>
                    <select
                      value={newCategory.emoji}
                      onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {EMOJI_OPTIONS.map(emoji => (
                        <option key={emoji} value={emoji}>{emoji}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      색상
                    </label>
                    <select
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {COLOR_OPTIONS.map(color => (
                        <option key={color.name} value={color.name}>{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategory({ label: '', emoji: '📌', color: 'blue' });
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    추가
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full border-2 border-gray-300 border-dashed rounded-lg p-4 text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                새 카테고리 추가
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
