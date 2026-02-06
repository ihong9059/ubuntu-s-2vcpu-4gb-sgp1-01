import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header, Footer } from "@/components/layout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "UTTEC | AI 스마트 솔루션",
  description: "40년 산업현장 경험과 AI 기술의 융합. 스마트팩토리, 스마트팜, AI 교육 플랫폼을 제공합니다.",
  keywords: ["스마트팩토리", "AI 예지보전", "스마트팜", "AI 교육", "UTTEC", "유티텍"],
  authors: [{ name: "UTTEC Co., Ltd." }],
  openGraph: {
    title: "UTTEC | AI 스마트 솔루션",
    description: "40년 산업현장 경험과 AI 기술의 융합",
    url: "https://uttec.co.kr",
    siteName: "UTTEC",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
