"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import type { WorkSchedule, ShiftEntry } from "@/types";
import { 
  PlusIcon, 
  ClockIcon, 
  CurrencyYenIcon, 
  BuildingOfficeIcon,
  CalendarIcon,
  TrashIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";

export default function WorkPage() {
  // すべての Hook を先頭で宣言
  const profile = useAppStore((s) => s.profile);
  const workSchedules = useAppStore((s) => s.workSchedules);
  const shifts = useAppStore((s) => s.shifts);
  const addWorkSchedule = useAppStore((s) => s.addWorkSchedule);
  const updateWorkSchedule = useAppStore((s) => s.updateWorkSchedule);
  const removeWorkSchedule = useAppStore((s) => s.removeWorkSchedule);
  const addShift = useAppStore((s) => s.addShift);
  const removeShift = useAppStore((s) => s.removeShift);
  const updateShift = useAppStore((s) => s.updateShift);
  const [activeTab, setActiveTab] = useState<'schedule' | 'shifts'>('schedule');
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddShift, setShowAddShift] = useState(false);

  // 初期プロフィール未設定時の分岐 (Hook はすでに宣言済み)
  if (!profile.birthDate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">初回設定が必要です</h2>
          <p className="text-gray-600 mb-6">勤務管理を利用するには、まず基本情報を設定してください</p>
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

  const addNewSchedule = () => {
    const newSchedule: WorkSchedule = {
      id: crypto.randomUUID(),
      employerId: profile.employers[0]?.id || "",
      weeklyHours: 0,
      hourlyWage: profile.defaultHourlyWage || 0,
      frequency: 'weekly',
      startDate: new Date().toISOString().split('T')[0]
    };
    addWorkSchedule(newSchedule);
    setShowAddSchedule(false);
  };

  const addNewShift = () => {
    const newShift: ShiftEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      hourlyWage: profile.defaultHourlyWage || 0,
      employerId: profile.employers[0]?.id || ""
    };
    addShift(newShift);
    setShowAddShift(false);
  };

  const calculateMonthlyIncome = (schedule: WorkSchedule) => {
    if (schedule.frequency === 'weekly') {
      return schedule.weeklyHours * schedule.hourlyWage * 4.33;
    } else {
      return schedule.weeklyHours * schedule.hourlyWage * 4.33;
    }
  };

  const totalScheduleIncome = workSchedules.reduce((sum, s) => sum + calculateMonthlyIncome(s), 0);
  const totalShiftIncome = shifts.reduce((sum, shift) => sum + (shift.hours * (shift.hourlyWage || 0)), 0);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">勤務管理</h1>
          <p className="text-gray-600">定期勤務とシフトを一元管理します</p>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">定期勤務</p>
              <p className="text-2xl font-bold text-gray-900">{workSchedules.length}件</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">個別シフト</p>
              <p className="text-2xl font-bold text-gray-900">{shifts.length}件</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyYenIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">月収見込み</p>
              <p className="text-2xl font-bold text-gray-900">{(totalScheduleIncome + totalShiftIncome).toLocaleString()}円</p>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="w-5 h-5 inline mr-2" />
              定期勤務
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'shifts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CalendarIcon className="w-5 h-5 inline mr-2" />
              個別シフト
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* 定期勤務タブ */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">定期勤務スケジュール</h2>
                <button
                  onClick={() => setShowAddSchedule(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  スケジュール追加
                </button>
              </div>

              {workSchedules.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">定期勤務スケジュールがありません</p>
                  <button
                    onClick={() => setShowAddSchedule(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    最初のスケジュールを追加
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {workSchedules.map((schedule) => {
                    const employer = profile.employers.find(e => e.id === schedule.employerId);
                    const monthlyIncome = calculateMonthlyIncome(schedule);
                    
                    return (
                      <div key={schedule.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">
                            {employer?.name || '未設定の勤務先'}
                          </h3>
                          <button
                            onClick={() => removeWorkSchedule(schedule.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              週間勤務時間
                            </label>
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              value={schedule.weeklyHours}
                              onChange={(e) => updateWorkSchedule(schedule.id, { weeklyHours: Number(e.target.value) })}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              時給
                            </label>
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              value={schedule.hourlyWage}
                              onChange={(e) => updateWorkSchedule(schedule.id, { hourlyWage: Number(e.target.value) })}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              頻度
                            </label>
                            <select
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              value={schedule.frequency}
                              onChange={(e) => updateWorkSchedule(schedule.id, { frequency: e.target.value as 'weekly' | 'monthly' })}
                            >
                              <option value="weekly">週間</option>
                              <option value="monthly">月間</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              開始日
                            </label>
                            <input
                              type="date"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              value={schedule.startDate}
                              onChange={(e) => updateWorkSchedule(schedule.id, { startDate: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900">月収見込み</span>
                            <span className="text-lg font-bold text-blue-900">
                              ¥{monthlyIncome.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 追加フォーム */}
              {showAddSchedule && (
                <div className="border rounded-lg p-6 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">新しい定期勤務を追加</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        勤務先
                      </label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                        {profile.employers.map(employer => (
                          <option key={employer.id} value={employer.id}>{employer.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        週間勤務時間
                      </label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        時給
                      </label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        開始日
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={addNewSchedule}
                    >
                      追加
                    </button>
                    <button 
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      onClick={() => setShowAddSchedule(false)}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 個別シフトタブ */}
          {activeTab === 'shifts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">個別シフト</h2>
                <button
                  onClick={() => setShowAddShift(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  シフト追加
                </button>
              </div>

              {shifts.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">個別シフトがありません</p>
                  <button
                    onClick={() => setShowAddShift(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    最初のシフトを追加
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {shifts.map((shift) => {
                    const employer = profile.employers.find(e => e.id === shift.employerId);
                    const shiftIncome = shift.hours * (shift.hourlyWage || 0);
                    
                    return (
                      <div key={shift.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">
                            {dayjs(shift.date).format('M月D日')} - {employer?.name || '未設定'}
                          </h3>
                          <button
                            onClick={() => removeShift(shift.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid gap-3 md:grid-cols-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              日付
                            </label>
                            <input
                              type="date"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              value={shift.date}
                              onChange={(e) => updateShift(shift.id, { date: e.target.value })}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              勤務時間
                            </label>
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              value={shift.hours}
                              onChange={(e) => updateShift(shift.id, { hours: Number(e.target.value) })}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              時給
                            </label>
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              value={shift.hourlyWage || 0}
                              onChange={(e) => updateShift(shift.id, { hourlyWage: Number(e.target.value) })}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-900">シフト収入</span>
                            <span className="font-bold text-green-900">
                              ¥{shiftIncome.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 追加フォーム */}
              {showAddShift && (
                <div className="border rounded-lg p-6 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">新しいシフトを追加</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        日付
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        勤務時間
                      </label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        時給
                      </label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={addNewShift}
                    >
                      追加
                    </button>
                    <button 
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      onClick={() => setShowAddShift(false)}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
