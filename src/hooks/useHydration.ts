/**
 * SSR/CSR ハイドレーション対応フック
 * Zustand persistによるハイドレーション問題を解決
 */

'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'

/**
 * ハイドレーション完了を待つフック
 * @returns ハイドレーション完了フラグ
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // クライアントサイドでのマウント後にハイドレーション完了とみなす
    setHydrated(true)
  }, [])

  return hydrated
}

/**
 * SSR対応のストアアクセスフック
 * ハイドレーション完了まで初期値を返す
 */
export function useHydratedStore() {
  const hydrated = useHydration()
  const store = useAppStore()

  return {
    hydrated,
    store: hydrated ? store : getInitialStore(),
  }
}

/**
 * 初期ストア状態（SSR時に使用）
 */
function getInitialStore() {
  return {
    profile: {
      birthDate: undefined,
      studentType: undefined,
      residenceCity: undefined,
      insuranceStatus: undefined,
      parentInsuranceType: undefined,
      livingStatus: undefined,
      monthlyAllowance: undefined,
      employers: [],
      otherIncome: undefined,
      grade: undefined,
      isParentDependent: undefined,
      employerSize: "unknown" as const,
      defaultHourlyWage: undefined,
      bracket: 103 as const,
      termsAccepted: false,
    },
    incomes: [],
    shifts: [],
    workSchedules: [],
    // アクション関数はダミー（非同期版）
    setProfile: () => {},
    loadProfile: async () => {},
    updateProfile: async () => {},
    loadEmployers: async () => {},
    addEmployer: async () => {},
    updateEmployer: async () => {},
    removeEmployer: async () => {},
    loadIncomes: async () => {},
    addIncome: async () => {},
    removeIncome: async () => {},
    loadShifts: async () => {},
    addShift: async () => {},
    updateShift: async () => {},
    removeShift: async () => {},
    loadWorkSchedules: async () => {},
    addWorkSchedule: async () => {},
    updateWorkSchedule: async () => {},
    removeWorkSchedule: async () => {},
    syncAllData: async () => {},
    isLoading: false,
    lastSyncTime: null,
    employers: [],
  }
}

/**
 * 安全なストアアクセス（ローディング表示付き）
 */
export function useStoreWithFallback() {
  const { store } = useHydratedStore()

  return {
    ...store,
  }
}
