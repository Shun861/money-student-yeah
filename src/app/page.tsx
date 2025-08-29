"use client";
import { useAppStore } from "@/lib/store";
import { calculateWalls } from "@/lib/rules";
export default function Home() {
  const profile = useAppStore((s) => s.profile);
  const incomes = useAppStore((s) => s.incomes);
  const shifts = useAppStore((s) => s.shifts);
  const r = calculateWalls(profile, incomes, shifts);
  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-semibold">ダッシュボード</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">今年の累計収入</div>
          <div className="text-2xl font-bold">{r.totalIncomeYTD.toLocaleString()} 円</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">103万円まで残り</div>
          <div className="text-2xl font-bold">{r.remainingTo103.toLocaleString()} 円</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">130万円まで残り</div>
          <div className="text-2xl font-bold">{r.remainingTo130.toLocaleString()} 円</div>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-gray-500 mb-2">あと働ける時間（概算）</div>
        <div className="text-lg">103万基準: {r.estimatedHoursLeftBy103} 時間 / 130万基準: {r.estimatedHoursLeftBy130} 時間</div>
      </div>
    </div>
  );
}
