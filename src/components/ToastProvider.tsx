"use client";
import React, { createContext, useContext, useCallback } from 'react';
import { Toast, ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { AppError, ErrorType, fromError } from '@/lib/errorHandling';

// Context型定義
interface ToastContextValue {
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  showErrorFromAppError: (error: AppError) => void;
  clearAllToasts: () => void;
}

// Context作成
const ToastContext = createContext<ToastContextValue | null>(null);

// ToastProvider コンポーネント
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast, showSuccess, showError, showWarning, showInfo } = useToast();

  // AppErrorからトーストメッセージを表示する関数
  const showErrorFromAppError = useCallback((error: AppError) => {
    let title: string;
    let message: string;

    // エラータイプに基づいて適切なメッセージを設定
    switch (error.type) {
      case ErrorType.NETWORK:
        title = 'ネットワークエラー';
        message = error.message || 'インターネット接続を確認してください';
        break;
      case ErrorType.AUTH:
        title = '認証エラー';
        message = error.message || 'ログインが必要です';
        break;
      case ErrorType.VALIDATION:
        title = '入力エラー';
        message = error.message || '入力内容を確認してください';
        break;
      case ErrorType.NOT_FOUND:
        title = 'データが見つかりません';
        message = error.message || '要求されたデータが存在しません';
        break;
      case ErrorType.SERVER:
      default:
        title = 'サーバーエラー';
        message = error.message || 'しばらく時間をおいて再度お試しください';
        break;
    }

    showError(title, message, 8000); // エラーは長めに表示
  }, [showError]);

  // 全てのトーストをクリア
  const clearAllToasts = useCallback(() => {
    toasts.forEach(toast => removeToast(toast.id));
  }, [toasts, removeToast]);

  const contextValue: ToastContextValue = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showErrorFromAppError,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast表示領域 */}
      {toasts.length > 0 && (
        <ToastContainer>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={removeToast}
            />
          ))}
        </ToastContainer>
      )}
    </ToastContext.Provider>
  );
}

// useToastContext フック
export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

// 便利関数: APIエラーレスポンスからトーストを表示
export function useApiErrorToast() {
  const { showErrorFromAppError } = useToastContext();

  return useCallback((error: unknown) => {
    let appError: AppError;
    
    if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
      // 既にAppError形式の場合
      appError = error as AppError;
    } else if (error instanceof Error) {
      // 一般的なErrorをAppErrorに変換
      appError = fromError(error);
    } else {
      // 不明なエラー
      appError = {
        type: ErrorType.SERVER,
        message: '予期しないエラーが発生しました',
        details: String(error),
        timestamp: new Date().toISOString()
      };
    }
    
    showErrorFromAppError(appError);
  }, [showErrorFromAppError]);
}
