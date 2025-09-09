import { NextRequest, NextResponse } from 'next/server'
import { AppError, ErrorAnalytics } from '@/lib/errorHandling'

/**
 * POST /api/error-report - エラー報告を受信・記録
 * クライアントサイドエラーを受信し、ログに記録します
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { error, analytics, version }: { 
      error: AppError
      analytics: ErrorAnalytics
      version: string 
    } = body

    // エラー情報をサーバーログに出力
    console.error('Client Error Report:', {
      timestamp: new Date().toISOString(),
      sessionId: analytics.sessionId,
      version,
      error: {
        type: error.type,
        message: error.message,
        url: error.url,
        userAgent: error.userAgent
      },
      device: {
        platform: analytics.deviceInfo.platform,
        viewport: analytics.deviceInfo.viewport,
        language: analytics.deviceInfo.language
      },
      network: analytics.networkInfo,
      performance: analytics.performanceMetrics,
      breadcrumbs: analytics.breadcrumbs.slice(-10) // 最新10件のみ
    })

    // TODO: 将来的にはデータベースやエラー追跡サービスに保存
    // - Supabaseのlogsテーブルに保存
    // - Sentryやバグレポートサービスに転送
    // - 重要なエラーはSlackやメールで通知

    return NextResponse.json({ 
      success: true,
      message: 'Error report received'
    })

  } catch (error) {
    console.error('Failed to process error report:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process error report'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/error-report - エラー統計情報を取得（開発用）
 */
export async function GET(): Promise<NextResponse> {
  // 開発環境でのみ利用可能
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 404 }
    )
  }

  // TODO: エラー統計情報を返す
  // - 過去24時間のエラー数
  // - エラータイプ別統計
  // - 影響を受けたユーザー数
  // - パフォーマンス統計

  return NextResponse.json({
    success: true,
    stats: {
      message: 'Error statistics feature coming soon'
    }
  })
}
