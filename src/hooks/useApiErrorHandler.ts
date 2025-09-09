/**
 * APIエラーハンドリング React フック
 */

"use client";
import { useCallback } from 'react';
import { useToastContext } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import { AppError, ErrorType, fromUnknown, safeAsync } from '@/lib/errorHandling';

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
    
    // トーストでエラー表示
    showErrorFromAppError(appError);
    
    // 認証エラーの場合は自動的にログインページにリダイレクト
    if (appError.type === ErrorType.AUTH) {
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
    const [result, error] = await safeAsync(asyncFn, options?.context);
    
    if (error) {
      if (!options?.suppressToast) {
        showErrorFromAppError(error);
      }
      
      // 認証エラーの場合は自動リダイレクト
      if (error.type === ErrorType.AUTH) {
        router.push('/auth/login');
      }
      
      options?.onError?.(error);
      return null;
    }
    
    if (result) {
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
