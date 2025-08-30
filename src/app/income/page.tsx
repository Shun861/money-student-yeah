"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { PlusIcon, BuildingOfficeIcon, CalendarIcon, CurrencyYenIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function IncomePage() {
  const addIncome = useAppStore((s) => s.addIncome);
  const removeIncome = useAppStore((s) => s.removeIncome);
  const incomes = useAppStore((s) => s.incomes);

  const [employer, setEmployer] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onAdd = async () => {
    if (!date || !amount || Number(amount) <= 0) return;
    
    setIsSubmitting(true);
    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addIncome({ id: crypto.randomUUID(), date, employer, amount: Number(amount) || 0 });
    setEmployer("");
    setDate("");
    setAmount("");
    setIsSubmitting(false);
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">収入入力</h1>
        <p className="text-sm text-gray-600 mt-1">月ごとの収入を記録して扶養枠を管理しましょう</p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">新しい収入を追加</h2>
        <div className="grid gap-4 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              placeholder="勤務先（任意）" 
              value={employer} 
              onChange={(e) => setEmployer(e.target.value)} 
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CurrencyYenIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              type="number" 
              inputMode="numeric" 
              placeholder="金額（円）" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
            />
          </div>
          
          <button 
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              !date || !amount || Number(amount) <= 0 || isSubmitting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
            onClick={onAdd}
            disabled={!date || !amount || Number(amount) <= 0 || isSubmitting}
          >
            <PlusIcon className="w-5 h-5" />
            {isSubmitting ? '追加中...' : '追加'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">入力済み収入</h2>
          <div className="text-sm text-gray-600">合計: {totalIncome.toLocaleString()} 円</div>
        </div>
        
        {incomes.length === 0 ? (
          <div className="text-center py-8">
            <CurrencyYenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <div className="text-gray-500 font-medium">まだ入力がありません</div>
            <div className="text-sm text-gray-400 mt-1">上記のフォームから収入を追加してください</div>
          </div>
        ) : (
          <div className="space-y-3">
            {incomes.map((income) => (
              <div key={income.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CurrencyYenIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {income.employer || '勤務先未設定'}
                    </div>
                    <div className="text-sm text-gray-500">{income.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{income.amount.toLocaleString()} 円</div>
                  </div>
                  <button
                    onClick={() => removeIncome(income.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


