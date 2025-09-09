"use client";
import React, { Component, ReactNode } from 'react';
import { 
  ErrorType, 
  AppError, 
  fromError, 
  getUserFriendlyMessage, 
  logError 
} from '@/lib/errorHandling';
import { ROUTES } from '@/constants/routes';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
  context?: string;
}

interface State {
  hasError: boolean;
  appError?: AppError;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const appError = fromError(error)
    logError(appError)
    return {
      hasError: true,
      appError
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const appError = fromError(error)
    
    // エラー詳細をログに記録
    logError({
      ...appError,
      details: `${appError.details}

Component Stack:
${errorInfo.componentStack}`
    })
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, appError: undefined });
  };

  render() {
    if (this.state.hasError && this.state.appError) {
      // カスタムフォールバックUIがある場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // エラー種別に応じたUI表示
      const userMessage = getUserFriendlyMessage(this.state.appError);
      const isAuthError = this.state.appError.type === ErrorType.AUTH;
      const isNetworkError = this.state.appError.type === ErrorType.NETWORK;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            {/* エラーアイコン */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* エラータイトル */}
            <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
              {isAuthError ? '認証エラー' : 
               isNetworkError ? 'ネットワークエラー' : 
               'アプリケーションエラー'}
            </h1>

            {/* ユーザーフレンドリーメッセージ */}
            <p className="text-gray-600 text-center mb-6">
              {userMessage}
            </p>

            {/* 開発環境でのエラー詳細 */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4 p-3 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer font-medium text-gray-700">
                  エラー詳細（開発環境のみ）
                </summary>
                <div className="mt-2 text-gray-600">
                  <p><strong>種別:</strong> {this.state.appError.type}</p>
                  <p><strong>メッセージ:</strong> {this.state.appError.message}</p>
                  <p><strong>時刻:</strong> {this.state.appError.timestamp}</p>
                  {this.state.appError.details && (
                    <div className="mt-2">
                      <strong>詳細:</strong>
                      <pre className="mt-1 text-xs bg-white p-2 rounded overflow-auto max-h-32">
                        {this.state.appError.details}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* アクションボタン */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                再試行
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ページ再読み込み
              </button>
            </div>

            {/* 認証エラーの場合は特別なアクション */}
            {isAuthError && (
              <button
                onClick={() => window.location.href = ROUTES.LOGIN}
                className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ログインページへ
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
