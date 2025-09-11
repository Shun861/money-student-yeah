"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useIsOnboardingCompleted } from "@/lib/profileUtils";
import { 
  PlusIcon, 
  CalendarIcon, 
  CurrencyYenIcon, 
  BuildingOfficeIcon,
  ClockIcon,
  TrashIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";

export default function IncomePage() {
  // すべての Hook は条件分岐より前に宣言
  const incomes = useAppStore((s) => s.incomes);
  const addIncome = useAppStore((s) => s.addIncome);
  const removeIncome = useAppStore((s) => s.removeIncome);
  const { isCompleted, isLoading } = useIsOnboardingCompleted();

  const [employer, setEmployer] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [hours, setHours] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // オンボーディング状態をロード中
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  // 初期プロフィール未設定時の早期レンダー (Hook は既に宣言済みなのでOK)
  if (!isCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">初回設定が必要です</h2>
          <p className="text-gray-600 mb-6">収入記録を利用するには、まず基本情報を設定してください</p>
          <a 
            href="/onboarding" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            初回設定を開始
          </a>
        </div>
      </div>
    );
  }

  const onAdd = () => {
    if (!date || !amount) return;
    addIncome({ 
      date, 
      employer, 
      amount: Number(amount) || 0,
      ...(hours && { hours: Number(hours) })
    });
    setEmployer("");
    setDate("");
    setAmount("");
    setHours("");
    setIsFormOpen(false);
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalHours = incomes.reduce((sum, income) => sum + (income.hours || 0), 0);
  const averageHourlyRate = totalHours > 0 ? totalIncome / totalHours : 0;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">収入記録</h1>
          <p className="text-gray-600">実際の収入を記録・管理します</p>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyYenIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">総収入</p>
              <p className="text-2xl font-bold text-gray-900">{totalIncome.toLocaleString()}円</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">総勤務時間</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours}時間</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyYenIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">平均時給</p>
              <p className="text-2xl font-bold text-gray-900">{averageHourlyRate.toLocaleString()}円</p>
            </div>
          </div>
        </div>
      </div>

      {/* 収入記録 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">収入記録</h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              収入を記録
            </button>
          </div>

          {/* 追加フォーム */}
          {isFormOpen && (
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">収入を記録</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                    勤務先
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="アルバイト先名（任意）" 
                    value={employer} 
                    onChange={(e) => setEmployer(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    勤務日
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CurrencyYenIcon className="h-4 w-4 inline mr-1" />
                    収入（円）
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    type="number" 
                    inputMode="numeric" 
                    placeholder="0" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ClockIcon className="h-4 w-4 inline mr-1" />
                    勤務時間（時間）
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    type="number" 
                    step="0.5"
                    placeholder="0" 
                    value={hours} 
                    onChange={(e) => setHours(e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  記録する
                </button>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {/* 収入リスト */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">記録済み収入</h3>
            {incomes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                まだ収入記録がありません
              </div>
            ) : (
              <div className="space-y-3">
                {incomes
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((income) => (
                    <div key={income.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CurrencyYenIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {income.employer || '勤務先未設定'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {dayjs(income.date).format('YYYY年M月D日')}
                              {income.hours && ` • ${income.hours}時間`}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {income.amount.toLocaleString()}円
                          </div>
                          {income.hours && (
                            <div className="text-sm text-gray-600">
                              {Math.round(income.amount / income.hours).toLocaleString()}円/時
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeIncome(income.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


