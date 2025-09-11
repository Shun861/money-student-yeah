"use client";
import { useState, useEffect, useCallback } from 'react';
import { useProfileApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { useToastContext } from '@/components/ToastProvider';
import { getProfile, updateProfile } from '@/lib/apiClient';
import { UserProfile } from '@/types';
import { ProfileUpdateRequest } from '@/types/api';

/**
 * Phase 2実装のテスト用プロフィール管理ページ
 */
export default function ProfileTestPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const { safeProfileExecute } = useProfileApiErrorHandler();
  const { showSuccess } = useToastContext();

  // プロフィール取得
  const loadProfile = useCallback(async () => {
    setLoading(true);
    
    await safeProfileExecute(
      () => getProfile(),
      {
        onSuccess: (response) => {
          setProfile(response.profile);
          if (response.profile) {
            showSuccess('プロフィール取得完了', 'プロフィールデータが正常に読み込まれました');
          } else {
            showSuccess('初回アクセス', 'プロフィールを作成してください');
          }
        },
        onError: (error) => {
          console.error('Profile load failed:', error);
        }
      }
    );
    
    setLoading(false);
  }, [safeProfileExecute, showSuccess]);

  // プロフィール更新テスト
  const testUpdateProfile = useCallback(async () => {
    if (!profile) return;
    
    setUpdating(true);
    
    const updateData: ProfileUpdateRequest = {
      grade: profile.grade === '1' ? '2' : '1', // テスト用に学年を切り替え
      studentType: profile.studentType || 'daytime',
    };

    await safeProfileExecute(
      () => updateProfile(updateData),
      {
        onSuccess: (response) => {
          setProfile(response.profile);
          showSuccess('プロフィール更新完了', `学年を${response.profile.grade}年に更新しました`);
        },
        onError: (error) => {
          console.error('Profile update failed:', error);
        }
      }
    );
    
    setUpdating(false);
  }, [profile, safeProfileExecute, showSuccess]);

  // 初期読み込み
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            API エラーハンドリング テスト
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Phase 2実装: ToastProvider と統一APIエラーハンドリングのテスト
          </p>
        </div>

        <div className="p-6">
          {/* 現在のプロフィール表示 */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">現在のプロフィール</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">読み込み中...</span>
              </div>
            ) : profile ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">学年:</span>
                    <span className="ml-2 text-gray-900">{profile.grade || '未設定'}年</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">学生種別:</span>
                    <span className="ml-2 text-gray-900">{profile.studentType || '未設定'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">居住地:</span>
                    <span className="ml-2 text-gray-900">{profile.residenceCity || '未設定'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">時給:</span>
                    <span className="ml-2 text-gray-900">
                      {profile.defaultHourlyWage ? `${profile.defaultHourlyWage}円` : '未設定'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                プロフィールが見つかりません
              </div>
            )}
          </div>

          {/* 操作ボタン */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">テスト操作</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={loadProfile}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '読み込み中...' : 'プロフィール再取得'}
              </button>
              
              <button
                onClick={testUpdateProfile}
                disabled={updating || !profile}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {updating ? '更新中...' : '学年更新テスト'}
              </button>
              
              <button
                onClick={() => {
                  // 意図的にエラーを発生させるテスト
                  safeProfileExecute(
                    () => Promise.reject(new Error('テスト用エラー')),
                    {
                      onError: () => {
                        console.log('テスト用エラーがキャッチされました');
                      }
                    }
                  );
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                エラーテスト
              </button>
            </div>
          </div>

          {/* 実装情報 */}
          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <h3 className="text-md font-medium text-blue-900 mb-2">実装された機能</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-1">Phase 1 & 2:</h4>
                <ul className="space-y-1">
                  <li>✅ 統一APIクライアント (apiClient.ts)</li>
                  <li>✅ グローバルToastProvider</li>
                  <li>✅ カスタムエラーハンドリングフック</li>
                  <li>✅ エラータイプ別メッセージ表示</li>
                  <li>✅ 認証エラー時の自動リダイレクト</li>
                  <li>✅ 非同期処理の安全実行</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1">Phase 3 (新機能):</h4>
                <ul className="space-y-1">
                  <li>✅ 強化されたエラーログシステム</li>
                  <li>✅ パフォーマンス監視 (LCP, CLS, Long Task)</li>
                  <li>✅ パンくずリスト機能</li>
                  <li>✅ デバイス・ネットワーク情報収集</li>
                  <li>✅ エラー報告API (/api/error-report)</li>
                  <li>✅ セッション追跡とアナリティクス</li>
                </ul>
              </div>
            </div>
          </div>

          {/* パフォーマンス監視情報 */}
          <div className="mt-6 bg-yellow-50 rounded-lg p-4">
            <h3 className="text-md font-medium text-yellow-900 mb-2">パフォーマンス監視</h3>
            <p className="text-sm text-yellow-800 mb-2">
              以下の指標が自動監視され、閾値を超えた場合にパンくずリストに記録されます：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-yellow-900">LCP:</span>
                <span className="text-yellow-800 ml-1">2.5秒以上で警告</span>
              </div>
              <div>
                <span className="font-medium text-yellow-900">CLS:</span>
                <span className="text-yellow-800 ml-1">0.1以上で警告</span>
              </div>
              <div>
                <span className="font-medium text-yellow-900">Long Task:</span>
                <span className="text-yellow-800 ml-1">50ms以上で警告</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
