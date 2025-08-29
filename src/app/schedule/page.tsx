"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";

export default function SchedulePage() {
  const addShift = useAppStore((s) => s.addShift);
  const shifts = useAppStore((s) => s.shifts);
  const hourly = useAppStore((s) => s.profile.defaultHourlyWage ?? 0);

  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");

  const onAdd = () => {
    if (!date || !hours) return;
    addShift({ id: crypto.randomUUID(), date, hours: Number(hours) || 0 });
    setDate("");
    setHours("");
  };

  const totalPlanned = shifts.reduce((sum, s) => sum + s.hours * (s.hourlyWage ?? hourly), 0);

  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-semibold">シフト予定</h1>
      <div className="grid gap-3 max-w-lg">
        <input className="border rounded px-3 py-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="border rounded px-3 py-2" type="number" inputMode="numeric" placeholder="時間数" value={hours} onChange={(e) => setHours(e.target.value)} />
        <button className="rounded bg-black text-white px-4 py-2 text-sm w-fit" onClick={onAdd}>追加</button>
      </div>

      <div className="rounded border p-4">
        <div className="text-sm text-gray-500">予定収入（概算）</div>
        <div className="text-2xl font-bold">{totalPlanned.toLocaleString()} 円</div>
      </div>

      <ul className="divide-y rounded border">
        {shifts.map((s) => (
          <li key={s.id} className="px-4 py-2 flex items-center justify-between text-sm">
            <span>{s.date}</span>
            <span className="font-semibold">{s.hours} 時間</span>
          </li>
        ))}
        {shifts.length === 0 && <li className="px-4 py-6 text-center text-sm text-gray-500">まだ入力がありません</li>}
      </ul>
    </div>
  );
}


