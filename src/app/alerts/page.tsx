"use client";
import { useAppStore } from "@/lib/store";
import { calculateWalls } from "@/lib/rules";

export default function AlertsPage() {
  const profile = useAppStore((s) => s.profile);
  const incomes = useAppStore((s) => s.incomes);
  const shifts = useAppStore((s) => s.shifts);

  const r = calculateWalls(profile, incomes, shifts);

  const alerts: string[] = [];
  if (r.remainingToLimit <= 5000) alerts.push(`${profile.bracket ?? 103}万円まであと${r.remainingToLimit.toLocaleString()}円`);

  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-semibold">アラート</h1>
      {alerts.length === 0 ? (
        <div className="rounded border p-4 text-sm text-gray-600">現在アラートはありません</div>
      ) : (
        <ul className="grid gap-2">
          {alerts.map((a, idx) => (
            <li key={idx} className="rounded border p-4 bg-yellow-50 text-yellow-900 text-sm">{a}</li>
          ))}
        </ul>
      )}
    </div>
  );
}


