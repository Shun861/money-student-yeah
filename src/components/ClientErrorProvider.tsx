"use client";
import { useEffect } from "react";
import { setupGlobalErrorHandlers } from "@/lib/errorHandling";

/**
 * クライアントサイドエラー処理の初期化
 * グローバルエラーハンドラーを設定
 */
export function ClientErrorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // グローバルエラーハンドラーの設定
    setupGlobalErrorHandlers();
  }, []);

  return <>{children}</>;
}
