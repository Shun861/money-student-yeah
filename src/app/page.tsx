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
      <div className="text-sm text-gray-600">選択中の扶養枠: {profile.bracket}万円</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">今年の累計収入</div>
          <div className="text-2xl font-bold">{r.totalIncomeYTD.toLocaleString()} 円</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">残り</div>
          <div className="text-2xl font-bold">{r.remainingToLimit.toLocaleString()} 円</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">使用率</div>
          <div className="text-2xl font-bold">{r.percentUsed}%</div>
        </div>
      </div>
      <ProgressBar percent={r.percentUsed} />
      <div className="rounded-lg border p-4">
        <div className="text-sm text-gray-500 mb-2">あと働ける時間（概算）</div>
        <div className="text-lg">103万基準: {r.estimatedHoursLeftBy103} 時間 / 130万基準: {r.estimatedHoursLeftBy130} 時間</div>
      </div>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const color = percent < 70 ? "bg-green-500" : percent < 90 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full rounded border p-4">
      <div className="text-sm text-gray-600 mb-2">進捗: {percent}%</div>
      <div className="h-3 w-full bg-gray-200 rounded">
        <div className={`h-3 ${color} rounded`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
