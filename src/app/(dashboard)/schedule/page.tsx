"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import type { WorkSchedule, ShiftEntry } from "@/types";
import { 
  ClockIcon, 
  PlusIcon, 
  TrashIcon, 
  CalendarIcon,
  CurrencyYenIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

import dayjs from "dayjs";

export default function SchedulePage() {
  const profile = useAppStore((s) => s.profile);
  const workSchedules = useAppStore((s) => s.workSchedules);
  const shifts = useAppStore((s) => s.shifts);
  const addWorkSchedule = useAppStore((s) => s.addWorkSchedule);
  const updateWorkSchedule = useAppStore((s) => s.updateWorkSchedule);
  const removeWorkSchedule = useAppStore((s) => s.removeWorkSchedule);
  const addShift = useAppStore((s) => s.addShift);
  const removeShift = useAppStore((s) => s.removeShift);
  const updateShift = useAppStore((s) => s.updateShift);

  const [activeTab, setActiveTab] = useState<'schedule' | 'shifts' | 'summary'>('schedule');

  const addNewSchedule = () => {
    const newSchedule: WorkSchedule = {
      id: Date.now().toString(),
      employerId: profile.employers[0]?.id || "",
      weeklyHours: 0,
      hourlyWage: profile.defaultHourlyWage || 0,
      frequency: 'weekly',
      startDate: new Date().toISOString().split('T')[0]
    };
    addWorkSchedule(newSchedule);
  };

  const addNewShift = () => {
    const newShift: ShiftEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      hourlyWage: profile.defaultHourlyWage || 0,
      employerId: profile.employers[0]?.id || ""
    };
    addShift(newShift);
  };

  const calculateMonthlyIncome = (schedule: WorkSchedule) => {
    if (schedule.frequency === 'weekly') {
      return schedule.weeklyHours * schedule.hourlyWage * 4.33; // 月平均4.33週
    } else {
      return schedule.weeklyHours * schedule.hourlyWage * 4.33;
    }
  };

  const calculateTotalIncome = () => {
    let total = 0;
    workSchedules.forEach(schedule => {
      total += calculateMonthlyIncome(schedule);
    });
    shifts.forEach(shift => {
      total += shift.hours * (shift.hourlyWage || 0);
    });
    return total;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">勤務時間管理</h1>
        <p className="text-gray-600">勤務時間と時給を入力して、収入を自動計算します</p>
      </div>

      {/* タブナビゲーション */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
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
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shifts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CalendarIcon className="w-5 h-5 inline mr-2" />
            個別シフト
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'summary'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ChartBarIcon className="w-5 h-5 inline mr-2" />
            収入サマリー
          </button>
        </nav>
      </div>

      {/* 定期勤務タブ */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">定期勤務スケジュール</h2>
            <button
              onClick={addNewSchedule}
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
                onClick={addNewSchedule}
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
        </div>
      )}

      {/* 個別シフトタブ */}
      {activeTab === 'shifts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">個別シフト</h2>
            <button
              onClick={addNewShift}
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
                onClick={addNewShift}
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
        </div>
      )}

      {/* 収入サマリータブ */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">収入サマリー</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">定期勤務収入</h3>
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                ¥{workSchedules.reduce((sum, s) => sum + calculateMonthlyIncome(s), 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">月収見込み</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">シフト収入</h3>
                <CalendarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                ¥{shifts.reduce((sum, s) => sum + s.hours * (s.hourlyWage || 0), 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">累計収入</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">総収入</h3>
                <CurrencyYenIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                ¥{calculateTotalIncome().toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">月収見込み</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium mb-4">扶養制限との比較</h3>
            <div className="space-y-3">
              {[103, 130, 150].map((limit) => {
                const monthlyLimit = limit * 10000;
                const currentIncome = calculateTotalIncome();
                                                  const percentage = Math.min(100, (currentIncome / monthlyLimit) * 100);
                
                return (
                  <div key={limit} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{limit}万円制限</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            percentage >= 90 ? 'bg-red-500' : 
                            percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
