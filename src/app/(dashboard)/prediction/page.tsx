"use client";
import { useState } from "react";
import { useHydratedStore } from "@/hooks/useHydration";
import { calculateIncomeFromSchedule } from "@/lib/rules";
import { IncomePrediction } from "@/components/ui/IncomePrediction";
import { 
  ArrowTrendingUpIcon, 
  ChartBarIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function PredictionPage() {
  const { hydrated, store } = useHydratedStore();
  const profile = store.profile;
  const incomes = store.incomes;
  const workSchedules = store.workSchedules;
  const shifts = store.shifts;

  const [useCustomIncome, setUseCustomIncome] = useState(false);
  const [customMonthlyIncome, setCustomMonthlyIncome] = useState<number>(0);

  // ハイドレーション待機中のローディング表示
  if (!hydrated) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  // 現在の月収を計算
  const currentYear = new Date().getFullYear();
  const currentIncome = calculateIncomeFromSchedule(profile, workSchedules, shifts, currentYear);
  const existingIncome = incomes
    .filter(i => new Date(i.date).getFullYear() === currentYear)
    .reduce((sum, i) => sum + i.amount, 0);
  
  const totalCurrentIncome = currentIncome + existingIncome;
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthlyIncome = totalCurrentIncome / currentMonth;

  const actualMonthlyIncome = useCustomIncome ? customMonthlyIncome : currentMonthlyIncome;

  return (
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">収入予測</h1>
        <p className="text-gray-600">現在の収入から将来の収入を予測し、キャリアプランを立てます</p>
      </div>

      {/* 現在の収入状況 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <ChartBarIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">現在の収入状況</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">現在の月収</div>
            <div className="text-2xl font-bold text-blue-600">
              ¥{currentMonthlyIncome.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">年間収入見込み</div>
            <div className="text-2xl font-bold text-green-600">
              ¥{(currentMonthlyIncome * 12).toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">勤務先数</div>
            <div className="text-2xl font-bold text-purple-600">
              {profile.employers.length}社
            </div>
          </div>
        </div>

        {/* カスタム収入設定 */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useCustomIncome}
                onChange={(e) => setUseCustomIncome(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">カスタム月収で予測</span>
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
      </div>

      {/* 収入予測 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold">収入予測シミュレーション</h2>
        </div>
        
        <IncomePrediction
          currentMonthlyIncome={actualMonthlyIncome}
          growthRate={5} // デフォルト5%成長
          months={12} // デフォルト12ヶ月
        />
      </div>

      {/* キャリアアドバイス */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <InformationCircleIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">キャリアアドバイス</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">収入向上のためのヒント</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>スキルアップによる時給向上</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>複数の収入源の確保</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>インターンシップへの参加</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>資格取得による専門性向上</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">扶養制限とのバランス</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>扶養制限内での効率的な働き方</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>質の高い仕事で時給向上</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>学習時間とのバランス</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>将来のキャリアを見据えた選択</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900 mb-2">予測について</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• この予測は現在の収入パターンを基にしたシミュレーションです</li>
              <li>• 実際の収入は市場環境や個人の努力により変動します</li>
              <li>• 定期的に予測を見直し、現実的な目標設定を行ってください</li>
              <li>• キャリアプランについては専門家にご相談ください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
