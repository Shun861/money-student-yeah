"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useToastContext } from "@/components/ToastProvider";
import { 
  HomeIcon, 
  ClockIcon, 
  UserIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  CurrencyYenIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";

// 学生目線でのシンプルなナビゲーション
const navigation = [
  { name: 'ホーム', href: '/dashboard', icon: HomeIcon, description: '現在の状況とクイックアクション' },
  { name: '収入記録', href: '/income', icon: CurrencyYenIcon, description: '実際の収入を記録・管理' },
  { name: '勤務管理', href: '/work', icon: ClockIcon, description: '定期勤務とシフト管理' },
  { name: '設定・予測', href: '/profile', icon: UserIcon, description: '個人設定・収入予測・シミュレーション' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { showError } = useToastContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // 成功時はNext.jsルーターを使用してナビゲーション
      router.push('/login');
      
    } catch (error) {
      console.error('Logout failed:', error);
      // トーストでエラーメッセージを表示
      showError(
        'ログアウトエラー', 
        'ログアウトに失敗しました。再度お試しください。'
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* オーバーレイ - 完全に透明 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <div className={`fixed top-0 left-0 z-50 w-64 h-full bg-white/80 backdrop-blur-sm shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* ヘッダー */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <span className="font-semibold text-gray-900">Money Student</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500 font-normal">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* ユーザーメニュー */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">ユーザー</p>
                <p className="text-xs text-gray-500">学生</p>
              </div>
              
              {/* アクションボタン */}
              <div className="flex items-center gap-2">
                <Link
                  href="/settings"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="設定"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                </Link>
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                  title={isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div>
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">MS</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm">Money Student</span>
            </Link>
            <div className="w-10"></div> {/* 中央揃えのためのスペーサー */}
          </div>
        </div>

        <main className="min-h-screen bg-gray-100 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary context="DashboardLayout">
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
