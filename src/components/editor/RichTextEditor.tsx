'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { useRef, useEffect } from 'react';
import { mergeAttributes } from '@tiptap/core';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link2,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Quote,
  Undo,
  Redo,
  ImageIcon,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Custom Image extension with width/height support
  const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null,
          parseHTML: element => element.getAttribute('width') || element.style.width,
          renderHTML: attributes => {
            if (!attributes.width) return {};
            return { width: attributes.width };
          },
        },
        height: {
          default: null,
          parseHTML: element => element.getAttribute('height') || element.style.height,
          renderHTML: attributes => {
            if (!attributes.height) return {};
            return { height: attributes.height };
          },
        },
      };
    },
    renderHTML({ HTMLAttributes }) {
      return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CustomImage.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg cursor-pointer',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
    immediatelyRender: false,
  });

  // content prop 변경 시 에디터 내용 업데이트
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // 이미지 리사이징 기능
  useEffect(() => {
    if (!editor || !editorRef.current) return;

    let selectedImage: HTMLImageElement | null = null;
    let resizeHandle: HTMLDivElement | null = null;
    let startX = 0;
    let startWidth = 0;

    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.stopPropagation();
        selectImage(target as HTMLImageElement);
      } else {
        deselectImage();
      }
    };

    const selectImage = (img: HTMLImageElement) => {
      deselectImage();
      selectedImage = img;

      // 이미지에 선택 스타일 추가
      img.style.outline = '2px solid #3b82f6';
      img.style.outlineOffset = '2px';

      // 리사이징 핸들 생성
      resizeHandle = document.createElement('div');
      resizeHandle.style.position = 'absolute';
      resizeHandle.style.width = '12px';
      resizeHandle.style.height = '12px';
      resizeHandle.style.backgroundColor = '#3b82f6';
      resizeHandle.style.border = '2px solid white';
      resizeHandle.style.borderRadius = '50%';
      resizeHandle.style.cursor = 'nwse-resize';
      resizeHandle.style.zIndex = '1000';
      resizeHandle.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

      // 핸들 위치 설정
      const updateHandlePosition = () => {
        if (!selectedImage || !resizeHandle) return;
        const rect = selectedImage.getBoundingClientRect();
        const editorRect = editorRef.current?.getBoundingClientRect();
        if (!editorRect) return;

        resizeHandle.style.left = `${rect.right - editorRect.left - 6}px`;
        resizeHandle.style.top = `${rect.bottom - editorRect.top - 6}px`;
      };

      updateHandlePosition();
      editorRef.current?.appendChild(resizeHandle);

      // 핸들 드래그 이벤트
      resizeHandle.addEventListener('mousedown', handleResizeStart);

      // 스크롤 시 핸들 위치 업데이트
      const editorContent = editorRef.current?.querySelector('.ProseMirror');
      editorContent?.addEventListener('scroll', updateHandlePosition);
    };

    const deselectImage = () => {
      if (selectedImage) {
        selectedImage.style.outline = '';
        selectedImage.style.outlineOffset = '';
        selectedImage = null;
      }
      if (resizeHandle) {
        resizeHandle.remove();
        resizeHandle = null;
      }
    };

    const handleResizeStart = (e: MouseEvent) => {
      if (!selectedImage) return;
      e.preventDefault();
      e.stopPropagation();

      startX = e.clientX;
      startWidth = selectedImage.offsetWidth;

      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    };

    const handleResizeMove = (e: MouseEvent) => {
      if (!selectedImage) return;

      const deltaX = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + deltaX);

      selectedImage.style.width = `${newWidth}px`;
      selectedImage.style.height = 'auto';

      // 핸들 위치 업데이트
      if (resizeHandle) {
        const rect = selectedImage.getBoundingClientRect();
        const editorRect = editorRef.current?.getBoundingClientRect();
        if (editorRect) {
          resizeHandle.style.left = `${rect.right - editorRect.left - 6}px`;
          resizeHandle.style.top = `${rect.bottom - editorRect.top - 6}px`;
        }
      }
    };

    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);

      // 에디터의 이미지 노드 속성 업데이트
      if (editor && selectedImage) {
        const newWidth = selectedImage.offsetWidth;

        // 이미지 노드의 위치를 찾아서 속성 업데이트
        const { state } = editor;
        const { doc } = state;
        let imagePos: number | null = null;

        // 이미지 src로 노드 찾기
        const imageSrc = selectedImage.getAttribute('src');
        doc.descendants((node, pos) => {
          if (node.type.name === 'image' && node.attrs.src === imageSrc) {
            imagePos = pos;
            return false;
          }
        });

        // 이미지 노드 속성 업데이트
        if (imagePos !== null) {
          editor.chain()
            .focus()
            .setNodeSelection(imagePos)
            .updateAttributes('image', {
              width: `${newWidth}px`,
              height: 'auto',
            })
            .run();
        }
      }
    };

    const editorElement = editorRef.current;
    editorElement?.addEventListener('click', handleImageClick);

    return () => {
      editorElement?.removeEventListener('click', handleImageClick);
      deselectImage();
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL을 입력하세요', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (url) {
        // 이미지 크기 입력 받기
        const width = window.prompt('이미지 너비를 입력하세요 (픽셀 단위, 비워두면 원본 크기):', '');

        if (width === null) {
          // 취소한 경우
          return;
        }

        if (width === '') {
          // 빈 값이면 크기 지정 없이 삽입
          editor.chain().focus().setImage({ src: url }).run();
        } else {
          // 숫자 검증
          const widthNum = parseInt(width, 10);
          if (isNaN(widthNum) || widthNum <= 0) {
            alert('올바른 숫자를 입력해주세요.');
            return;
          }
          // 크기 지정하여 삽입 (width 속성 사용)
          editor.chain().focus().setImage({
            src: url,
            alt: '',
            title: '',
            width: widthNum
          }).run();
        }
      }
    };
    reader.readAsDataURL(file);

    // input 초기화
    event.target.value = '';
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* 툴바 */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* 실행취소/다시실행 */}
        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="실행취소"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="다시실행"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* 제목 */}
        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 rounded text-sm font-semibold ${
              editor.isActive('heading', { level: 1 }) ? 'bg-blue-200' : 'hover:bg-gray-200'
            }`}
            title="제목 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 rounded text-sm font-semibold ${
              editor.isActive('heading', { level: 2 }) ? 'bg-blue-200' : 'hover:bg-gray-200'
            }`}
            title="제목 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 rounded text-sm font-semibold ${
              editor.isActive('heading', { level: 3 }) ? 'bg-blue-200' : 'hover:bg-gray-200'
            }`}
            title="제목 3"
          >
            H3
          </button>
        </div>

        {/* 텍스트 스타일 */}
        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            title="굵게"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${editor.isActive('italic') ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            title="기울임"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded ${editor.isActive('underline') ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            title="밑줄"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
        </div>

        {/* 정렬 */}
        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-blue-200' : 'hover:bg-gray-200'
            }`}
            title="왼쪽 정렬"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-blue-200' : 'hover:bg-gray-200'
            }`}
            title="가운데 정렬"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-blue-200' : 'hover:bg-gray-200'
            }`}
            title="오른쪽 정렬"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* 리스트 */}
        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            title="글머리 기호 목록"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            title="번호 매기기 목록"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* 기타 */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={setLink}
            className={`p-2 rounded ${editor.isActive('link') ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            title="링크"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-200"
            title="이미지 삽입"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            title="인용"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded ${editor.isActive('codeBlock') ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            title="코드 블록"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* 에디터 영역 */}
      <div ref={editorRef} className="bg-white relative">
        <EditorContent editor={editor} />
      </div>

      {/* 도움말 */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-500">
        💡 팁: 이미지를 클릭한 후 우측 하단 핸들을 드래그하여 크기를 조절할 수 있습니다
      </div>
    </div>
  );
}
