/**
 * 統一エラーハンドリングライブラリ
 * アプリケーション全体でのエラー処理を標準化
 */

import { ApiErrorResponse } from '@/types/api'

// ========================================
// エラー種別定義
// ========================================

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH', 
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  message: string
  details?: string
  originalError?: Error
  timestamp: string
  userAgent?: string
  url?: string
}

// ========================================
// エラー分類・変換関数
// ========================================

/**
 * APIエラーレスポンスをAppErrorに変換
 */
export function fromApiError(apiError: ApiErrorResponse, context?: string): AppError {
  let type: ErrorType
  
  switch (apiError.error.code) {
    case 'UNAUTHORIZED':
    case 'FORBIDDEN':
      type = ErrorType.AUTH
      break
    case 'NOT_FOUND':
      type = ErrorType.NOT_FOUND
      break
    case 'VALIDATION_ERROR':
      type = ErrorType.VALIDATION
      break
    case 'DATABASE_ERROR':
    case 'INTERNAL_ERROR':
      type = ErrorType.SERVER
      break
    default:
      type = ErrorType.UNKNOWN
  }

  return {
    type,
    message: apiError.error.message,
    details: typeof apiError.error.details === 'string' 
      ? apiError.error.details 
      : JSON.stringify(apiError.error.details),
    timestamp: new Date().toISOString(),
    url: context
  }
}

/**
 * 一般的なErrorオブジェクトをAppErrorに変換
 */
export function fromError(error: Error, context?: string): AppError {
  let type: ErrorType

  // ネットワークエラーの判定
  if (error.message.includes('fetch') || error.message.includes('network')) {
    type = ErrorType.NETWORK
  }
  // 認証エラーの判定
  else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
    type = ErrorType.AUTH
  }
  // その他はクライアントエラーとして分類
  else {
    type = ErrorType.CLIENT
  }

  return {
    type,
    message: error.message,
    details: error.stack,
    originalError: error,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : context
  }
}

/**
 * 不明なエラーをAppErrorに変換
 */
export function fromUnknown(error: unknown, context?: string): AppError {
  if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
    // 既にAppError形式
    return error as AppError
  }
  
  if (error instanceof Error) {
    return fromError(error, context)
  }
  
  return {
    type: ErrorType.UNKNOWN,
    message: typeof error === 'string' ? error : 'Unknown error occurred',
    details: JSON.stringify(error),
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : context
  }
}

/**
 * 非同期処理をsafe wrapする関数
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  context?: string
): Promise<[T | null, AppError | null]> {
  try {
    const result = await asyncFn()
    return [result, null]
  } catch (error) {
    const appError = fromUnknown(error, context)
    return [null, appError]
  }
}

// ========================================
// エラーログ機能
// ========================================

/**
 * 開発環境でのエラーログ
 */
export function logError(appError: AppError): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error [${appError.type}]`)
    console.error('Message:', appError.message)
    console.error('Details:', appError.details)
    console.error('Timestamp:', appError.timestamp)
    console.error('URL:', appError.url)
    if (appError.originalError) {
      console.error('Original Error:', appError.originalError)
    }
    console.groupEnd()
  } else {
    // 本番環境では構造化ログとして出力
    console.error(JSON.stringify({
      level: 'error',
      type: appError.type,
      message: appError.message,
      timestamp: appError.timestamp,
      url: appError.url,
      userAgent: appError.userAgent
    }))
  }
}

/**
 * エラーを報告サービスに送信（将来的な拡張用）
 */
export function reportError(appError: AppError): void {
  // TODO: 将来的にSentryやBugsnagなどのエラー報告サービスに送信
  logError(appError)
}

// ========================================
// ユーザー向けエラーメッセージ
// ========================================

/**
 * ユーザーフレンドリーなエラーメッセージを生成
 */
export function getUserFriendlyMessage(appError: AppError): string {
  switch (appError.type) {
    case ErrorType.NETWORK:
      return 'インターネット接続を確認してください'
    case ErrorType.AUTH:
      return 'ログインが必要です。再度ログインしてください'
    case ErrorType.VALIDATION:
      return '入力内容に誤りがあります。確認してください'
    case ErrorType.NOT_FOUND:
      return '要求されたページまたはデータが見つかりません'
    case ErrorType.SERVER:
      return 'サーバーエラーが発生しました。しばらく時間をおいて再試行してください'
    case ErrorType.CLIENT:
      return 'アプリケーションエラーが発生しました。ページを再読み込みしてください'
    default:
      return '予期しないエラーが発生しました。サポートにお問い合わせください'
  }
}

// ========================================
// エラーハンドリングフック
// ========================================

/**
 * 非同期処理用のエラーハンドラー
 */
export function createAsyncErrorHandler(context?: string) {
  return (error: unknown) => {
    const appError = fromUnknown(error, context)
    reportError(appError)
    return appError
  }
}

/**
 * Promise rejection用のグローバルハンドラー
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window !== 'undefined') {
    // 未処理のPromise rejection
    window.addEventListener('unhandledrejection', (event) => {
      const appError = fromUnknown(event.reason, 'unhandledrejection')
      reportError(appError)
    })

    // 未処理のエラー
    window.addEventListener('error', (event) => {
      const appError = fromError(event.error, event.filename)
      reportError(appError)
    })
  }
}
