import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SNS 베스트 추천 꿀템",
  description: "숏폼 화제의 베스트 상품 모음",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-X6Z633985W"} />
    </html>
  );
}