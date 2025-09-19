"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { 
  UserIcon,
  Cog6ToothIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  KeyIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useAppStore } from '@/lib/store';
import { useToastContext } from '@/components/ToastProvider';

// アカウント削除の状態管理
interface DeleteAccountState {
  isOpen: boolean;
  step: 1 | 2 | 3; // 1: 警告, 2: 確認入力, 3: 最終確認
  password: string;
  confirmationText: string;
  isDeleting: boolean;
  error: string | null;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAppStore();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  
  // アカウント削除の状態管理
  const [deleteState, setDeleteState] = useState<DeleteAccountState>({
    isOpen: false,
    step: 1,
    password: '',
    confirmationText: '',
    isDeleting: false,
    error: null
  });

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

  // アカウント削除処理
  const handleDeleteAccount = async () => {
    setDeleteState(prev => ({ ...prev, isDeleting: true, error: null }));
    
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deleteState.password,
          confirmationText: deleteState.confirmationText
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'アカウント削除に失敗しました');
      }

      // 成功時: トースト表示 + ログインページにリダイレクト
      showSuccess(
        'アカウント削除完了', 
        'アカウントが正常に削除されました。ご利用ありがとうございました。',
        3000
      );
      
      // 少し遅延してリダイレクト（トーストを見せるため）
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      
    } catch (error) {
      console.error('Account deletion error:', error);
      const errorMessage = error instanceof Error ? error.message : 'アカウント削除に失敗しました';
      
      showError('削除エラー', errorMessage);
      setDeleteState(prev => ({ 
        ...prev, 
        error: errorMessage
      }));
    } finally {
      setDeleteState(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // 削除状態のリセット
  const resetDeleteState = () => {
    setDeleteState({
      isOpen: false,
      step: 1,
      password: '',
      confirmationText: '',
      isDeleting: false,
      error: null
    });
  };

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
              
              {!deleteState.isOpen ? (
                <button 
                  onClick={() => setDeleteState(prev => ({ ...prev, isOpen: true }))}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  アカウントを削除
                </button>
              ) : (
                <DeleteAccountForm 
                  state={deleteState}
                  setState={setDeleteState}
                  onConfirm={handleDeleteAccount}
                  onCancel={resetDeleteState}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// アカウント削除フォームコンポーネント
interface DeleteAccountFormProps {
  state: DeleteAccountState;
  setState: React.Dispatch<React.SetStateAction<DeleteAccountState>>;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteAccountForm({ state, setState, onConfirm, onCancel }: DeleteAccountFormProps) {
  const isStep2Valid = state.password.length >= 6 && state.confirmationText === "DELETE";
  
  return (
    <div className="space-y-4 border-t border-red-200 pt-4">
      {/* エラー表示 */}
      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span className="text-sm">{state.error}</span>
          </div>
        </div>
      )}
      
      {/* ステップ1: 警告確認 */}
      {state.step === 1 && (
        <div>
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-red-900 mb-2">⚠️ 最終警告</h4>
            <p className="text-sm text-red-800 mb-3">
              この操作によりアカウントとすべてのデータが永久に削除されます。
            </p>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• 収入記録、勤務データが完全削除</li>
              <li>• プロフィール情報が完全削除</li>
              <li>• 雇用者情報が完全削除</li>
              <li>• 復元は一切不可能</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            上記のリスクを理解し、本当にアカウントを削除する場合のみ続行してください。
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => setState(prev => ({ ...prev, step: 2 }))}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
            >
              理解しました - 続行
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
      
      {/* ステップ2: 認証情報入力 */}
      {state.step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              現在のパスワード <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={state.password}
              onChange={(e) => setState(prev => ({ ...prev, password: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="パスワードを入力してください"
              disabled={state.isDeleting}
            />
            <p className="text-xs text-gray-500 mt-1">本人確認のため現在のパスワードが必要です</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              確認文字列 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={state.confirmationText}
              onChange={(e) => setState(prev => ({ ...prev, confirmationText: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="DELETE"
              disabled={state.isDeleting}
            />
            <p className="text-xs text-gray-500 mt-1">
              誤操作防止のため「<strong>DELETE</strong>」と正確に入力してください
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setState(prev => ({ ...prev, step: 3 }))}
              disabled={!isStep2Valid || state.isDeleting}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              最終確認へ
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, step: 1 }))}
              disabled={state.isDeleting}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400 disabled:opacity-50 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      )}
      
      {/* ステップ3: 最終確認 */}
      {state.step === 3 && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900 mb-2">最終確認</h4>
              <p className="text-sm text-red-800 mb-4">
                本当にアカウントを削除しますか？この操作は<strong>絶対に取り消せません</strong>。
              </p>
              
              <div className="bg-white border border-red-200 rounded p-3 mb-4">
                <p className="text-xs text-gray-600 font-mono">
                  実行予定の操作: 全データ削除 → 認証ユーザー削除 → ログアウト
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={onConfirm}
                  disabled={state.isDeleting}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {state.isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      削除中...
                    </>
                  ) : (
                    'アカウントを削除'
                  )}
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, step: 2 }))}
                  disabled={state.isDeleting}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400 disabled:opacity-50 transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={onCancel}
                  disabled={state.isDeleting}
                  className="text-gray-500 hover:text-gray-700 px-2 py-2 text-sm transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}