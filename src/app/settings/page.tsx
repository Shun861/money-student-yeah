"use client";
import { useAppStore } from "@/lib/store";

export default function SettingsPage() {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);

  return (
    <div className="grid gap-6 max-w-xl">
      <h1 className="text-xl font-semibold">設定</h1>
      <label className="grid gap-1">
        <span className="text-sm text-gray-600">扶養枠</span>
        <select
          className="border rounded px-3 py-2"
          value={profile.bracket ?? 103}
          onChange={(e) => setProfile({ bracket: Number(e.target.value) as 103 | 130 | 150 })}
        >
          <option value={103}>103万円</option>
          <option value={130}>130万円</option>
          <option value={150}>150万円</option>
        </select>
      </label>
    </div>
  );
}


