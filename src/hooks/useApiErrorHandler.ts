/**
 * APIエラーハンドリング React フック
 */

"use client";
import { useCallback } from 'react';
import { useToastContext } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import { AppError, ErrorType, fromUnknown, safeAsync, addBreadcrumb } from '@/lib/errorHandling';

/**
 * APIエラーハンドリング用カスタムフック
 */
export function useApiErrorHandler() {
  const { showErrorFromAppError } = useToastContext();
  const router = useRouter();

  /**
   * エラーを処理し、適切な通知・リダイレクトを行う
   */
  const handleError = useCallback((error: unknown, context?: string) => {
    const appError = fromUnknown(error, context);
    
    // エラー処理をパンくずリストに追加
    addBreadcrumb({
      category: 'error',
      message: `Error handled: ${appError.type}`,
      level: 'error',
      data: { 
        type: appError.type,
        message: appError.message,
        context 
      }
    });
    
    // トーストでエラー表示
    showErrorFromAppError(appError);
    
    // 認証エラーの場合は自動的にログインページにリダイレクト
    if (appError.type === ErrorType.AUTH) {
      addBreadcrumb({
        category: 'navigation',
        message: 'Redirecting to login due to auth error',
        level: 'info'
      });
      router.push('/auth/login');
    }
    
    return appError;
  }, [showErrorFromAppError, router]);

  /**
   * 非同期処理を安全に実行（エラーハンドリング付き）
   */
  const safeExecute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      context?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: AppError) => void;
      suppressToast?: boolean;
    }
  ): Promise<T | null> => {
    // 実行開始をパンくずリストに追加
    addBreadcrumb({
      category: 'user_action',
      message: `Safe async execution started: ${options?.context || 'unknown'}`,
      level: 'info',
      data: { context: options?.context }
    });

    const [result, error] = await safeAsync(asyncFn, options?.context);
    
    if (error) {
      if (!options?.suppressToast) {
        showErrorFromAppError(error);
      }
      
      // 認証エラーの場合は自動リダイレクト
      if (error.type === ErrorType.AUTH) {
        addBreadcrumb({
          category: 'navigation',
          message: 'Redirecting to login due to auth error',
          level: 'info'
        });
        router.push('/auth/login');
      }
      
      options?.onError?.(error);
      return null;
    }
    
    if (result) {
      // 成功をパンくずリストに追加
      addBreadcrumb({
        category: 'user_action',
        message: `Safe async execution completed: ${options?.context || 'unknown'}`,
        level: 'info',
        data: { context: options?.context }
      });
      
      options?.onSuccess?.(result);
    }
    
    return result;
  }, [showErrorFromAppError, router]);

  return {
    handleError,
    safeExecute,
  };
}

/**
 * Profile API専用のエラーハンドリングフック
 */
export function useProfileApiErrorHandler() {
  const baseHandler = useApiErrorHandler();
  
  const handleProfileError = useCallback((error: unknown) => {
    return baseHandler.handleError(error, 'ProfileAPI');
  }, [baseHandler]);

  const safeProfileExecute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: AppError) => void;
      suppressToast?: boolean;
    }
  ) => {
    return baseHandler.safeExecute(asyncFn, {
      context: 'ProfileAPI',
      ...options,
    });
  }, [baseHandler]);

  return {
    handleProfileError,
    safeProfileExecute,
    ...baseHandler,
  };
}
