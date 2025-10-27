import type { Metadata } from "next";
import "./globals.css";
import ConditionalNoticeComponents from "@/components/ConditionalNoticeComponents";

export const metadata: Metadata = {
  title: "AIDT 공지사항",
  description: "AIDT 교육자료 서비스 공지사항",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {/* 배너와 모달 (관리자 페이지 제외) */}
        <ConditionalNoticeComponents />

        {/* 메인 콘텐츠 */}
        {children}
      </body>
    </html>
  );
}
