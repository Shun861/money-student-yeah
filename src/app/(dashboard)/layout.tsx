"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ClockIcon, 
  CalculatorIcon, 
  ArrowTrendingUpIcon, 
  PlusIcon, 
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";

const navigation = [
  { name: 'ダッシュボード', href: '/', icon: HomeIcon },
  { name: '勤務管理', href: '/schedule', icon: ClockIcon },
  { name: 'シミュレーション', href: '/simulation', icon: CalculatorIcon },
  { name: '収入予測', href: '/prediction', icon: ArrowTrendingUpIcon },
  { name: '収入記録', href: '/income', icon: PlusIcon },
  { name: '詳細レポート', href: '/profile', icon: ChartBarIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* サイドバー */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* ロゴ */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <span className="font-semibold text-gray-900">Money Student</span>
            </Link>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
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
              <Link
                href="/settings"
                className="text-gray-400 hover:text-gray-600"
              >
                <Cog6ToothIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
