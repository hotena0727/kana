import type { Metadata } from "next";
import "./globals.css";
import FloatingConsultButton from "@/components/FloatingConsultButton";

export const metadata: Metadata = {
  title: "하테나일본어 문자와 발음",
  description:
    "히라가나와 가타카나를 익히고 퀴즈와 오답 복습으로 반복 학습하는 일본어 입문 앱.",
  applicationName: "하테나일본어 문자와 발음",
  keywords: [
    "일본어",
    "히라가나",
    "가타카나",
    "일본어 앱",
    "카나 학습",
    "일본어 입문",
    "하테나",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <FloatingConsultButton />
      </body>
    </html>
  );
}