"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { predictDependencyExceed } from "@/lib/rules";
import { SimulationChart } from "@/components/ui/SimulationChart";
import { 
  ChartBarIcon, 
  CalculatorIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function SimulationPage() {
  const profile = useAppStore((s) => s.profile);
  const incomes = useAppStore((s) => s.incomes);
  const workSchedules = useAppStore((s) => s.workSchedules);
  const shifts = useAppStore((s) => s.shifts);

  const [customMonthlyIncome, setCustomMonthlyIncome] = useState<number>(0);
  const [useCustomIncome, setUseCustomIncome] = useState(false);

  // シミュレーション計算
  const simulation = predictDependencyExceed(
    profile,
    incomes,
    workSchedules,
    shifts
  );

  // カスタム収入でのシミュレーション
  const customSimulation = useCustomIncome && customMonthlyIncome > 0 
    ? predictDependencyExceed(
        profile,
        incomes,
        workSchedules,
        shifts
      )
    : null;

  const currentSimulation = useCustomIncome ? customSimulation : simulation;

  return (
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">扶養超過シミュレーション</h1>
        <p className="text-gray-600">現在の収入ペースから扶養制限を超える時期を予測します</p>
      </div>

      {/* カスタム収入設定 */}
      <div className="alumnote-card p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <CalculatorIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">シミュレーション設定</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useCustomIncome}
              onChange={(e) => setUseCustomIncome(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium">カスタム月収でシミュレーション</span>
          </label>
          
          {useCustomIncome && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="月収を入力"
                value={customMonthlyIncome}
                onChange={(e) => setCustomMonthlyIncome(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 w-32"
              />
              <span className="text-sm text-gray-600">円</span>
            </div>
          )}
        </div>
      </div>

      {/* シミュレーション結果 */}
      {currentSimulation && (
        <div className="space-y-8">
          {/* 予測サマリー */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">月平均収入</h3>
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                ¥{currentSimulation.monthlyAverage.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">現在のペース</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">年間予測収入</h3>
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                ¥{(currentSimulation.monthlyAverage * 12).toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">12ヶ月分</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">扶養制限</h3>
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {(profile.bracket ?? 103)}万円
              </div>
              <p className="text-sm text-gray-500 mt-1">選択中の制限</p>
            </div>
          </div>

          {/* シミュレーショングラフ */}
          <SimulationChart
            data={currentSimulation.simulationData}
            exceedDate={currentSimulation.exceedDate}
            exceedAmount={currentSimulation.exceedAmount}
            monthlyAverage={currentSimulation.monthlyAverage}
          />

          {/* 詳細分析 */}
          <div className="alumnote-card p-6">
            <h3 className="text-xl font-semibold mb-6">詳細分析</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* 扶養制限との比較 */}
              <div>
                <h4 className="text-lg font-medium mb-4">扶養制限との比較</h4>
                <div className="space-y-3">
                  {[103, 130, 150].map((limit) => {
                    const limitAmount = limit * 10000;
                    const currentIncome = currentSimulation.monthlyAverage * 12;
                    const percentage = Math.min(100, (currentIncome / limitAmount) * 100);
                    const remaining = Math.max(0, limitAmount - currentIncome);
                    
                    return (
                      <div key={limit} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{limit}万円制限</span>
                          <span className="text-sm font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              percentage >= 90 ? 'bg-red-500' : 
                              percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          残り: ¥{remaining.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 推奨アクション */}
              <div>
                <h4 className="text-lg font-medium mb-4">推奨アクション</h4>
                {currentSimulation.exceedDate ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-red-900">扶養制限超過のリスク</h5>
                        <p className="text-sm text-red-800 mt-1">
                          現在のペースでは{new Date(currentSimulation.exceedDate).toLocaleDateString('ja-JP', { month: 'long' })}頃に扶養制限を超える見込みです。
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>対策案:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>勤務時間の調整</li>
                        <li>時給の見直し</li>
                        <li>扶養制限の変更検討</li>
                        <li>収入源の分散</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-green-900">扶養制限内で安定</h5>
                      <p className="text-sm text-green-800 mt-1">
                        現在のペースでは扶養制限を超える心配はありません。安心して働けます。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 注意事項 */}
      <div className="alumnote-card p-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900 mb-2">注意事項</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• このシミュレーションは予測であり、実際の結果を保証するものではありません</li>
              <li>• 収入の変動や制度変更により予測が変わる可能性があります</li>
              <li>• 正確な判定については税理士や社会保険労務士にご相談ください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
