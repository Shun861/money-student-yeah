"use client";
import { useAppStore } from "@/lib/store";
import { calculateWalls } from "@/lib/rules";
import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { ComponentType } from "react";

export default function AlertsPage() {
  const profile = useAppStore((s) => s.profile);
  const incomes = useAppStore((s) => s.incomes);

  const r = calculateWalls(profile, incomes);

  const alerts: Array<{ type: 'warning' | 'info' | 'success'; message: string; icon: ComponentType<{ className?: string }> }> = [];
  
  // Warning alerts for approaching limits
  if (r.remainingToLimit <= 5000) {
    alerts.push({
      type: 'warning',
      message: `${profile.bracket ?? 103}万円まであと${r.remainingToLimit.toLocaleString()}円です`,
      icon: ExclamationTriangleIcon
    });
  }
  
  // Info alerts for general status
  if (r.percentUsed > 80) {
    alerts.push({
      type: 'info',
      message: `現在${r.percentUsed}%使用中です。注意深く管理しましょう。`,
      icon: InformationCircleIcon
    });
  }
  
  // Success message when well under limit
  if (r.percentUsed < 50) {
    alerts.push({
      type: 'success',
      message: `順調です！まだ${r.remainingToLimit.toLocaleString()}円余裕があります。`,
      icon: CheckCircleIcon
    });
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">アラート</h1>
        <div className="text-sm text-gray-500">({alerts.length}件)</div>
      </div>
      
      {alerts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-gray-600 font-medium">現在アラートはありません</div>
          <div className="text-sm text-gray-500 mt-1">順調に管理できています</div>
        </div>
      ) : (
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
      )}

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">プチ金融教育：扶養の「壁」解説</h2>
        <p className="text-sm text-gray-600 mb-4">よくある3つの壁について、超えると何が起きるのかを簡単にまとめました。</p>
        <div className="grid gap-3">
          <details className="rounded-lg border p-4 bg-gray-50" open>
            <summary className="cursor-pointer font-medium">103万円の壁（所得税・住民税の目安）</summary>
            <div className="mt-2 text-sm text-gray-700 leading-6">
              年間収入が約103万円を超えると、本人に<span className="font-semibold">所得税</span>や翌年の<span className="font-semibold">住民税</span>がかかり始める可能性があります。
              また、親の<span className="font-semibold">扶養控除</span>に影響することがあります。短期バイトやシフト調整で最も意識される基準です。
            </div>
          </details>

          <details className="rounded-lg border p-4 bg-gray-50">
            <summary className="cursor-pointer font-medium">130万円の壁（社会保険の目安）</summary>
            <div className="mt-2 text-sm text-gray-700 leading-6">
              年間収入が約130万円を超えると、条件により<span className="font-semibold">健康保険・年金</span>の<span className="font-semibold">本人加入</span>が必要になる場合があります（勤務先の規模や労働時間で異なります）。
              親の<span className="font-semibold">被扶養者</span>から外れると、保険料負担や手取りに影響します。
            </div>
          </details>

          <details className="rounded-lg border p-4 bg-gray-50">
            <summary className="cursor-pointer font-medium">150万円の壁（配偶者特別控除などの目安）</summary>
            <div className="mt-2 text-sm text-gray-700 leading-6">
              家庭状況によっては、150万円近辺で<span className="font-semibold">控除の段階的縮小</span>が始まります。厳密な影響は親の年収や制度改正に左右されるため、
              大きなシフト変更の前に一度計算しておくと安心です。
            </div>
          </details>

          <div className="text-xs text-gray-500 mt-2">
            参考: 目安の数値です。最新の税制・勤務条件により変わる可能性があります。最終判断は公式情報や専門家にご相談ください。
          </div>
        </div>
      </section>
    </div>
  );
}


