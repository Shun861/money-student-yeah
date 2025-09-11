import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ClientErrorProvider } from "@/components/ClientErrorProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { validateEnvironment, checkEnvironmentStatus } from '@/lib/env';

// Issue #46: 起動時環境変数チェック
if (typeof window === 'undefined') {
  // サーバーサイドでのみ実行
  try {
    validateEnvironment();
    
    // 開発環境では詳細な診断情報を表示
    if (process.env.NODE_ENV === 'development') {
      const status = checkEnvironmentStatus();
      console.log(`🚀 Starting on ${status.platform} (${status.environment})`);
      
      if (status.warnings.length > 0) {
        console.warn('⚠️  Environment warnings:', status.warnings);
      }
    }
  } catch (error) {
    console.error('💥 Failed to start application:', error);
    throw error;
  }
}

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

// === Next.js 15 型安全なメタデータ定義 ===
export const metadata: Metadata = {
  title: {
    template: '%s | MoneyStudentYeah',
    default: 'MoneyStudentYeah - 学生向け収入管理アプリ',
  },
  description: '学生のアルバイト収入管理とタックスプランニングをサポートするWebアプリケーション',
  keywords: ['学生', 'アルバイト', '収入管理', '税金', '扶養', '103万円の壁', '130万円の壁'],
  authors: [{ name: 'MoneyStudentYeah Team' }],
  creator: 'MoneyStudentYeah',
  publisher: 'MoneyStudentYeah',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://money-student-yeah.vercel.app',
    title: 'MoneyStudentYeah - 学生向け収入管理アプリ',
    description: '学生のアルバイト収入管理とタックスプランニングをサポートするWebアプリケーション',
    siteName: 'MoneyStudentYeah',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MoneyStudentYeah - 学生向け収入管理アプリ',
    description: '学生のアルバイト収入管理とタックスプランニングをサポートするWebアプリケーション',
  },
  verification: {
    google: process.env['NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION'],
  },
  category: 'finance',
} as const;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
} as const;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ErrorBoundary context="RootLayout">
					<ToastProvider>
						<ClientErrorProvider>
							{children}
						</ClientErrorProvider>
					</ToastProvider>
				</ErrorBoundary>
			</body>
		</html>
	);
}
