"use client";
import { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Settings page error:', error);
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          設定ページの読み込みに失敗しました
        </h2>
        <p className="text-gray-600 mb-6">
          一時的な問題が発生しています。再度お試しください。
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    </div>
  );
}