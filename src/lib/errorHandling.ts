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
  // 強化されたログ機能を使用
  logErrorWithAnalytics(appError)
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

// ========================================
// Phase 3: エラーログ強化
// ========================================

/**
 * エラー分析用の詳細情報
 */
export interface ErrorAnalytics {
  sessionId: string
  userId?: string
  deviceInfo: DeviceInfo
  networkInfo: NetworkInfo
  performanceMetrics: PerformanceMetrics
  breadcrumbs: Breadcrumb[]
}

export interface DeviceInfo {
  userAgent: string
  platform: string
  language: string
  screenResolution: string
  viewport: string
  colorDepth: number
  timezone: string
}

export interface NetworkInfo {
  connectionType?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
  online: boolean
}

export interface PerformanceMetrics {
  pageLoadTime?: number
  domContentLoaded?: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  memoryUsage?: number
}

export interface Breadcrumb {
  timestamp: string
  category: 'navigation' | 'user_action' | 'api_call' | 'error' | 'info'
  message: string
  level: 'debug' | 'info' | 'warning' | 'error'
  data?: Record<string, unknown>
}

/**
 * エラー分析情報を収集
 */
export function collectErrorAnalytics(): ErrorAnalytics {
  const sessionId = getSessionId()
  
  return {
    sessionId,
    deviceInfo: collectDeviceInfo(),
    networkInfo: collectNetworkInfo(),
    performanceMetrics: collectPerformanceMetrics(),
    breadcrumbs: getBreadcrumbs()
  }
}

/**
 * デバイス情報を収集
 */
function collectDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'server',
      platform: 'server',
      language: 'ja',
      screenResolution: 'unknown',
      viewport: 'unknown',
      colorDepth: 0,
      timezone: 'Asia/Tokyo'
    }
  }

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

/**
 * ネットワーク情報を収集
 */
function collectNetworkInfo(): NetworkInfo {
  if (typeof window === 'undefined') {
    return { online: true }
  }

  const connection = (navigator as unknown as { connection?: { type?: string; effectiveType?: string; downlink?: number; rtt?: number } }).connection
  
  return {
    connectionType: connection?.type,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    online: navigator.onLine
  }
}

/**
 * パフォーマンスメトリクスを収集
 */
function collectPerformanceMetrics(): PerformanceMetrics {
  if (typeof window === 'undefined' || !window.performance) {
    return {}
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const paint = performance.getEntriesByType('paint')
  
  const metrics: PerformanceMetrics = {}

  if (navigation) {
    metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart
    metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart
  }

  paint.forEach(entry => {
    if (entry.name === 'first-contentful-paint') {
      metrics.firstContentfulPaint = entry.startTime
    }
  })

  // メモリ使用量（Chrome限定）
  if ('memory' in performance) {
    const memory = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory
    metrics.memoryUsage = memory.usedJSHeapSize
  }

  return metrics
}

// セッション管理
let sessionId: string | null = null
const breadcrumbs: Breadcrumb[] = []

/**
 * セッションIDを取得または生成
 */
function getSessionId(): string {
  if (!sessionId) {
    sessionId = generateId()
  }
  return sessionId
}

/**
 * パンくずリストを取得
 */
function getBreadcrumbs(): Breadcrumb[] {
  return [...breadcrumbs]
}

/**
 * パンくずリストにエントリを追加
 */
export function addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>) {
  const entry: Breadcrumb = {
    ...breadcrumb,
    timestamp: new Date().toISOString()
  }
  
  breadcrumbs.push(entry)
  
  // 最大100件まで保持
  if (breadcrumbs.length > 100) {
    breadcrumbs.shift()
  }
}

/**
 * IDを生成
 */
function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

/**
 * 強化されたエラーログ関数
 */
export function logErrorWithAnalytics(appError: AppError): void {
  const analytics = collectErrorAnalytics()
  
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Enhanced Error [${appError.type}]`)
    console.error('Error Details:', appError)
    console.error('Device Info:', analytics.deviceInfo)
    console.error('Network Info:', analytics.networkInfo)
    console.error('Performance:', analytics.performanceMetrics)
    console.error('Breadcrumbs:', analytics.breadcrumbs.slice(-5)) // 最新5件
    console.groupEnd()
  } else {
    // 本番環境では構造化ログとして出力
    console.error(JSON.stringify({
      level: 'error',
      timestamp: appError.timestamp,
      sessionId: analytics.sessionId,
      error: {
        type: appError.type,
        message: appError.message,
        details: appError.details
      },
      context: {
        url: appError.url,
        userAgent: analytics.deviceInfo.userAgent
      },
      analytics: {
        network: analytics.networkInfo,
        performance: analytics.performanceMetrics
      }
    }))
  }
  
  // エラー報告サービスに送信
  sendErrorReport(appError, analytics)
}

/**
 * エラー報告サービスに送信
 */
async function sendErrorReport(appError: AppError, analytics: ErrorAnalytics): Promise<void> {
  // 本番環境でのみ送信
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  try {
    let endpoint = process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT
    if (!endpoint) {
      endpoint = '/api/error-report'
    }

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: appError,
        analytics,
        version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown'
      })
    })
  } catch (error) {
    // エラー報告の送信に失敗した場合は無視（無限ループを避ける）
    console.warn('Failed to send error report:', error)
  }
}

/**
 * パフォーマンス監視
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * パフォーマンス監視を開始
   */
  start(): void {
    if (typeof window === 'undefined') {
      return
    }

    // LCP (Largest Contentful Paint) を監視
    this.observeEntry('largest-contentful-paint', (entries) => {
      const lcp = entries[entries.length - 1]
      if (lcp.startTime > 2500) { // 2.5秒以上の場合
        addBreadcrumb({
          category: 'info',
          message: `Slow LCP detected: ${lcp.startTime}ms`,
          level: 'warning',
          data: { lcp: lcp.startTime }
        })
      }
    })

    // CLS (Cumulative Layout Shift) を監視
    this.observeEntry('layout-shift', (entries) => {
      let cls = 0
      entries.forEach(entry => {
        if (!((entry as unknown as { hadRecentInput?: boolean }).hadRecentInput)) {
          cls += (entry as unknown as { value: number }).value
        }
      })
      
      if (cls > 0.1) { // CLSが0.1以上の場合
        addBreadcrumb({
          category: 'info',
          message: `High CLS detected: ${cls}`,
          level: 'warning',
          data: { cls }
        })
      }
    })

    // ロングタスクを監視
    this.observeEntry('longtask', (entries) => {
      entries.forEach(entry => {
        if (entry.duration > 50) { // 50ms以上のタスク
          addBreadcrumb({
            category: 'info',
            message: `Long task detected: ${entry.duration}ms`,
            level: 'warning',
            data: { duration: entry.duration }
          })
        }
      })
    })
  }

  private observeEntry(entryType: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries())
      })
      
      observer.observe({ entryTypes: [entryType] })
      this.observers.push(observer)
    } catch (error) {
      console.warn(`Failed to observe ${entryType}:`, error)
    }
  }

  /**
   * 監視を停止
   */
  stop(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

/**
 * エラーハンドリング機能の初期化
 */
export function initializeErrorHandling(): void {
  setupGlobalErrorHandlers()
  PerformanceMonitor.getInstance().start()
  
  // ナビゲーション時のパンくずリスト追加
  if (typeof window !== 'undefined') {
    // ページロード時
    addBreadcrumb({
      category: 'navigation',
      message: `Page loaded: ${window.location.pathname}`,
      level: 'info',
      data: { url: window.location.href }
    })

    // ページアンロード時
    window.addEventListener('beforeunload', () => {
      addBreadcrumb({
        category: 'navigation',
        message: `Page unloading: ${window.location.pathname}`,
        level: 'info'
      })
    })
  }
}
