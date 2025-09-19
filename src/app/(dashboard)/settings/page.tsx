"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { 
  UserIcon,
  Cog6ToothIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  KeyIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useAppStore } from '@/lib/store';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAppStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-gray-600 mt-1">アカウントとプライバシー設定</p>
      </div>

      <div className="space-y-8">
        {/* プロフィール設定セクション */}
        <section className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            プロフィール設定
          </h2>
          
          <div className="space-y-4">
            {/* ユーザー情報表示 */}
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {profile?.display_name || 'ユーザー'}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <Link 
                href="/profile" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                編集
              </Link>
            </div>

            {/* オンボーディング状態 */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">プロフィール設定状況</h3>
                  <p className="text-sm text-gray-500">
                    {profile?.onboarding_completed ? 
                      '初期設定が完了しています' : 
                      'プロフィール設定を完了してください'
                    }
                  </p>
                </div>
                <div className={`h-3 w-3 rounded-full ${
                  profile?.onboarding_completed ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
              </div>
              {!profile?.onboarding_completed && (
                <Link 
                  href="/onboarding"
                  className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  初期設定を完了する →
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* アカウント設定セクション */}
        <section className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Cog6ToothIcon className="h-5 w-5" />
            アカウント設定
          </h2>
          
          <div className="space-y-4">
            {/* メールアドレス */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900">メールアドレス</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">認証済み</span>
            </div>

            {/* 最終ログイン */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900">最終ログイン</h3>
                  <p className="text-sm text-gray-500">
                    {user?.last_sign_in_at ? 
                      new Date(user.last_sign_in_at).toLocaleString('ja-JP') :
                      '情報がありません'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* パスワード変更 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <KeyIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900">パスワード</h3>
                  <p className="text-sm text-gray-500">セキュリティ保護のため定期的に変更してください</p>
                </div>
              </div>
              <button 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
                disabled
              >
                変更（準備中）
              </button>
            </div>

            {/* セッション管理 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900">アクティブセッション</h3>
                  <p className="text-sm text-gray-500">現在のデバイスでログイン中</p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">1セッション</span>
            </div>
          </div>
        </section>

        {/* 危険な操作セクション */}
        <section className="bg-white rounded-lg border border-red-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5" />
            危険な操作
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2">アカウントの削除</h3>
              <p className="text-sm text-red-700 mb-4">
                アカウントを削除すると、すべてのデータが永久に削除され、復元できません。
                この操作は取り消すことができませんので、慎重に検討してください。
              </p>
              <ul className="text-sm text-red-700 mb-4 space-y-1">
                <li>• すべての収入記録が削除されます</li>
                <li>• シフト予定と勤務履歴が削除されます</li>
                <li>• プロフィール情報が削除されます</li>
                <li>• このアクションは元に戻せません</li>
              </ul>
              <button 
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
                disabled
              >
                アカウントを削除（準備中）
              </button>
              <p className="text-xs text-red-600 mt-2">
                ※ アカウント削除機能は次のフェーズで利用可能になります
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}