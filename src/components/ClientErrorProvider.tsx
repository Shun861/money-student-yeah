"use client";
import { useEffect } from 'react';
import { initializeErrorHandling, addBreadcrumb } from '@/lib/errorHandling';
import { usePathname } from 'next/navigation';

/**
 * クライアントサイドエラーハンドリングの初期化
 */
export function ClientErrorProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // エラーハンドリング機能を初期化
    initializeErrorHandling();
  }, []);

  // ルート変更時のパンくずリスト追加
  useEffect(() => {
    addBreadcrumb({
      category: 'navigation',
      message: `Navigated to: ${pathname}`,
      level: 'info',
      data: { pathname }
    });
  }, [pathname]);

  return <>{children}</>;
}
