"use client";
import { useAppStore } from "@/lib/store";
import { calculateWalls } from "@/lib/rules";

export default function ReportPage() {
  const profile = useAppStore((s) => s.profile);
  const incomes = useAppStore((s) => s.incomes);
  const shifts = useAppStore((s) => s.shifts);
  const r = calculateWalls(profile, incomes, shifts);

  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-semibold">レポート</h1>
      <div className="rounded border p-4">
        <div className="text-sm text-gray-500">現在の収入状況</div>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>累計収入</div>
          <div className="text-right font-semibold">{r.totalIncomeYTD.toLocaleString()} 円</div>
          <div>103万円まで残り</div>
          <div className="text-right font-semibold">{r.remainingTo103.toLocaleString()} 円</div>
          <div>130万円まで残り</div>
          <div className="text-right font-semibold">{r.remainingTo130.toLocaleString()} 円</div>
        </div>
      </div>
      <button className="rounded bg-black text-white px-4 py-2 text-sm w-fit" onClick={() => window.print()}>PDFとして保存（印刷）</button>
    </div>
  );
}


