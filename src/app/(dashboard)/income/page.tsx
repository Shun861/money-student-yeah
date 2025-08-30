"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";

export default function IncomePage() {
  const addIncome = useAppStore((s) => s.addIncome);
  const incomes = useAppStore((s) => s.incomes);

  const [employer, setEmployer] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");

  const onAdd = () => {
    if (!date || !amount) return;
    addIncome({ id: crypto.randomUUID(), date, employer, amount: Number(amount) || 0 });
    setEmployer("");
    setDate("");
    setAmount("");
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-semibold">収入入力</h1>
      <div className="grid gap-3 max-w-lg">
        <input className="border rounded px-3 py-2" placeholder="勤務先（任意）" value={employer} onChange={(e) => setEmployer(e.target.value)} />
        <input className="border rounded px-3 py-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="border rounded px-3 py-2" type="number" inputMode="numeric" placeholder="金額（円）" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="rounded bg-black text-white px-4 py-2 text-sm w-fit" onClick={onAdd}>追加</button>
      </div>

      <div className="grid gap-2">
        <h2 className="font-medium">入力済み</h2>
        <ul className="divide-y rounded border">
          {incomes.map((i) => (
            <li key={i.id} className="px-4 py-2 flex items-center justify-between text-sm">
              <span>{i.date} · {i.employer || "-"}</span>
              <span className="font-semibold">{i.amount.toLocaleString()} 円</span>
            </li>
          ))}
          {incomes.length === 0 && <li className="px-4 py-6 text-center text-sm text-gray-500">まだ入力がありません</li>}
        </ul>
      </div>
    </div>
  );
}


