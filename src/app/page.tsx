"use client";
import { useAppStore } from "@/lib/store";
import { calculateWalls } from "@/lib/rules";
import { 
  CurrencyYenIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  InformationCircleIcon,
  PlusIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Home() {
  const profile = useAppStore((s) => s.profile);
  const incomes = useAppStore((s) => s.incomes);
  const r = calculateWalls(profile, incomes);

  const getStatusColor = (percent: number) => {
    if (percent < 70) return 'text-green-600';
    if (percent < 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (percent: number) => {
    if (percent < 70) return CheckCircleIcon;
    if (percent < 90) return ExclamationTriangleIcon;
    return ExclamationTriangleIcon;
  };

  const StatusIcon = getStatusIcon(r.percentUsed);

  // アラートの生成
  const alerts: Array<{ type: 'warning' | 'info' | 'success'; message: string; icon: React.ComponentType<{ className?: string }> }> = [];
  
  if (r.remainingToLimit <= 5000) {
    alerts.push({
      type: 'warning',
      message: `${profile.bracket ?? 103}万円まであと${r.remainingToLimit.toLocaleString()}円です`,
      icon: ExclamationTriangleIcon
    });
  }
  
  if (r.percentUsed > 80) {
    alerts.push({
      type: 'info',
      message: `現在${r.percentUsed}%使用中です。注意深く管理しましょう。`,
      icon: InformationCircleIcon
    });
  }
  
  if (r.percentUsed < 50) {
    alerts.push({
      type: 'success',
      message: `順調です！まだ${r.remainingToLimit.toLocaleString()}円余裕があります。`,
      icon: CheckCircleIcon
    });
  }

  return (
    <div className="grid gap-8">
      {/* ヒーローセクション */}
      <div className="alumnote-gradient rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">扶養調整ダッシュボード</h1>
            <div className="text-blue-100 text-lg">選択中の扶養枠: {profile.bracket}万円</div>
          </div>
          <div className={`flex items-center gap-3 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm`}>
            <StatusIcon className="w-6 h-6" />
            <span className="font-medium">
              {r.percentUsed < 70 ? '安全' : r.percentUsed < 90 ? '注意' : '危険'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="alumnote-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <CurrencyYenIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">今年の累計収入</div>
              <div className="text-2xl font-bold text-gray-900">{r.totalIncomeYTD.toLocaleString()} 円</div>
            </div>
          </div>
        </div>

        <div className="alumnote-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">残り稼げる額</div>
              <div className="text-2xl font-bold text-gray-900">{r.remainingToLimit.toLocaleString()} 円</div>
            </div>
          </div>
        </div>

        <div className="alumnote-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">使用率</div>
              <div className={`text-2xl font-bold ${getStatusColor(r.percentUsed)}`}>{r.percentUsed}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="alumnote-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">扶養枠の使用状況</h3>
          <div className="text-2xl font-bold text-blue-600">{r.percentUsed}%</div>
        </div>
        <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-6 ${
              r.percentUsed < 70 ? 'bg-green-500' : 
              r.percentUsed < 90 ? 'bg-yellow-500' : 'bg-red-500'
            } rounded-full transition-all duration-500 ease-out`} 
            style={{ width: `${r.percentUsed}%` }} 
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span>{profile.bracket ?? 103}万円</span>
          <span>100%</span>
        </div>
      </div>

      {/* アラートセクション */}
      {alerts.length > 0 && (
        <div className="alumnote-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">アラート</h3>
            <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
              {alerts.length}件
            </div>
          </div>
          <div className="grid gap-4">
            {alerts.map((alert, idx) => {
              const Icon = alert.icon;
              const colors = {
                warning: 'bg-red-50 border-red-200 text-red-800',
                info: 'bg-blue-50 border-blue-200 text-blue-800',
                success: 'bg-green-50 border-green-200 text-green-800'
              };
              return (
                <div key={idx} className={`rounded-xl border p-4 flex items-start gap-4 ${colors[alert.type]}`}>
                  <Icon className="w-6 h-6 mt-0.5 flex-shrink-0" />
                  <div className="text-sm font-medium">{alert.message}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* クイックアクション */}
      <div className="alumnote-card p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">クイックアクション</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link 
            href="/income" 
            className="alumnote-card p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <PlusIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">収入を記録</div>
                <div className="text-sm text-gray-600">新しい収入を追加</div>
              </div>
            </div>
          </Link>
          
          <Link 
            href="/profile" 
            className="alumnote-card p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">詳細レポート</div>
                <div className="text-sm text-gray-600">グラフと分析を見る</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="alumnote-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 rounded-xl">
            <ClockIcon className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">あと働ける時間（概算）</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-gray-900 mb-2">{r.estimatedHoursLeftBy103}</div>
            <div className="text-sm text-gray-600">103万基準（時間）</div>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-gray-900 mb-2">{r.estimatedHoursLeftBy130}</div>
            <div className="text-sm text-gray-600">130万基準（時間）</div>
          </div>
        </div>
      </div>
    </div>
  );
}


