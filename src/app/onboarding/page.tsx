"use client";
import { useAppStore, type EmployerSize } from "@/lib/store";

export default function OnboardingPage() {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);

  return (
    <div className="grid gap-6 max-w-xl">
      <h1 className="text-xl font-semibold">初回診断</h1>
      <label className="grid gap-1">
        <span className="text-sm text-gray-600">学年</span>
        <input
          className="border rounded px-3 py-2"
          value={profile.grade ?? ""}
          onChange={(e) => setProfile({ grade: e.target.value })}
          placeholder="例: 大学2年"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-gray-600">親の扶養</span>
        <select
          className="border rounded px-3 py-2"
          value={profile.isParentDependent === undefined ? "" : profile.isParentDependent ? "yes" : "no"}
          onChange={(e) => setProfile({ isParentDependent: e.target.value === "yes" })}
        >
          <option value="">選択してください</option>
          <option value="yes">はい</option>
          <option value="no">いいえ</option>
        </select>
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-gray-600">勤務先規模</span>
        <select
          className="border rounded px-3 py-2"
          value={profile.employerSize ?? "unknown"}
          onChange={(e) => setProfile({ employerSize: e.target.value as EmployerSize })}
        >
          <option value="unknown">未選択</option>
          <option value="small">小規模</option>
          <option value="medium">中規模</option>
          <option value="large">大規模</option>
        </select>
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-gray-600">時給（円）</span>
        <input
          className="border rounded px-3 py-2"
          type="number"
          inputMode="numeric"
          value={profile.defaultHourlyWage ?? ""}
          onChange={(e) => setProfile({ defaultHourlyWage: Number(e.target.value || 0) || undefined })}
          placeholder="例: 1200"
        />
      </label>
    </div>
  );
}


