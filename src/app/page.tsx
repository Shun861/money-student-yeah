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
  const alerts: Array<{ type: 'warning' | 'info' | 'success'; message: string; icon: any }> = [];
  
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
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
          <div className="text-sm text-gray-600 mt-1">選択中の扶養枠: {profile.bracket}万円</div>
        </div>
        <div className={`flex items-center gap-2 ${getStatusColor(r.percentUsed)}`}>
          <StatusIcon className="w-6 h-6" />
          <span className="text-sm font-medium">
            {r.percentUsed < 70 ? '安全' : r.percentUsed < 90 ? '注意' : '危険'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyYenIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600">今年の累計収入</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{r.totalIncomeYTD.toLocaleString()} 円</div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-sm text-gray-600">残り</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{r.remainingToLimit.toLocaleString()} 円</div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-sm text-gray-600">使用率</div>
          </div>
          <div className={`text-3xl font-bold ${getStatusColor(r.percentUsed)}`}>{r.percentUsed}%</div>
        </div>
      </div>

      <ProgressBar percent={r.percentUsed} />

      {/* アラートセクション */}
      {alerts.length > 0 && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">アラート</h3>
            <div className="text-sm text-gray-500">({alerts.length}件)</div>
          </div>
          <div className="grid gap-3">
            {alerts.map((alert, idx) => {
              const Icon = alert.icon;
              const colors = {
                warning: 'bg-red-50 border-red-200 text-red-800',
                info: 'bg-blue-50 border-blue-200 text-blue-800',
                success: 'bg-green-50 border-green-200 text-green-800'
              };
              return (
                <div key={idx} className={`rounded-lg border p-4 flex items-start gap-3 ${colors[alert.type]}`}>
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm font-medium">{alert.message}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* クイックアクション */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">クイックアクション</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link 
            href="/income" 
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <PlusIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">収入を記録</div>
              <div className="text-sm text-gray-600">新しい収入を追加</div>
            </div>
          </Link>
          
          <Link 
            href="/profile" 
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium">詳細レポート</div>
              <div className="text-sm text-gray-600">グラフと分析を見る</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ClockIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-sm text-gray-600 font-medium">あと働ける時間（概算）</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{r.estimatedHoursLeftBy103}</div>
            <div className="text-sm text-gray-600">103万基準（時間）</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{r.estimatedHoursLeftBy130}</div>
            <div className="text-sm text-gray-600">130万基準（時間）</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const getColor = (percent: number) => {
    if (percent < 70) return "bg-green-500";
    if (percent < 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getBgColor = (percent: number) => {
    if (percent < 70) return "bg-green-100";
    if (percent < 90) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700">扶養枠の使用状況</div>
        <div className="text-sm font-bold text-gray-900">{percent}%</div>
      </div>
      <div className={`h-4 w-full ${getBgColor(percent)} rounded-full overflow-hidden`}>
        <div 
          className={`h-4 ${getColor(percent)} rounded-full transition-all duration-500 ease-out`} 
          style={{ width: `${percent}%` }} 
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
