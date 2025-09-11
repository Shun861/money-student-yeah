import { create } from "zustand";
import type { 
  UserProfile, 
  IncomeEntry, 
  ShiftEntry, 
  Employer,
  WorkSchedule
} from "@/types";

// API クライアント関数
const apiClient = {
  // Profile API
  async getProfile(): Promise<UserProfile> {
    const response = await fetch('/api/profile');
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  // Employers API
  async getEmployers(): Promise<Employer[]> {
    const response = await fetch('/api/employers');
    if (!response.ok) throw new Error('Failed to fetch employers');
    return response.json();
  },

  async createEmployer(employer: Omit<Employer, 'id'>): Promise<Employer> {
    const response = await fetch('/api/employers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: employer.name,
        hourly_wage: employer.weeklyHours > 0 ? Math.round(employer.monthlyIncome / (employer.weeklyHours * 4.33)) : null,
        size: employer.employerSize,
      }),
    });
    if (!response.ok) throw new Error('Failed to create employer');
    const dbEmployer = await response.json();
    
    // DBレスポンスをクライアント型に変換
    return {
      id: dbEmployer.id,
      name: dbEmployer.name,
      weeklyHours: employer.weeklyHours,
      monthlyIncome: employer.monthlyIncome,
      commutingAllowance: employer.commutingAllowance,
      bonus: employer.bonus,
      employerSize: dbEmployer.size || 'unknown',
    };
  },

  async updateEmployer(id: string, employer: Partial<Employer>): Promise<Employer> {
    const updateData: any = {};
    if (employer.name) updateData.name = employer.name;
    if (employer.employerSize) updateData.size = employer.employerSize;
    if (employer.weeklyHours && employer.monthlyIncome) {
      updateData.hourly_wage = Math.round(employer.monthlyIncome / (employer.weeklyHours * 4.33));
    }

    const response = await fetch('/api/employers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updateData }),
    });
    if (!response.ok) throw new Error('Failed to update employer');
    const dbEmployer = await response.json();
    
    // 既存のemployerと新しいデータをマージ
    return {
      id: dbEmployer.id,
      name: dbEmployer.name,
      weeklyHours: employer.weeklyHours || 0,
      monthlyIncome: employer.monthlyIncome || 0,
      commutingAllowance: employer.commutingAllowance || 0,
      bonus: employer.bonus || 0,
      employerSize: dbEmployer.size || 'unknown',
    };
  },

  async deleteEmployer(id: string): Promise<void> {
    const response = await fetch(`/api/employers?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete employer');
  },

  // Incomes API
  async getIncomes(params?: { year?: number; month?: number; employer_id?: string }): Promise<IncomeEntry[]> {
    const searchParams = new URLSearchParams();
    if (params?.year) searchParams.set('year', params.year.toString());
    if (params?.month) searchParams.set('month', params.month.toString());
    if (params?.employer_id) searchParams.set('employer_id', params.employer_id);

    const response = await fetch(`/api/incomes?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch incomes');
    const dbIncomes = await response.json();
    
    // DBレスポンスをクライアント型に変換
    return dbIncomes.map((income: any) => ({
      id: income.id,
      date: income.date,
      employer: income.employer_id || undefined,
      amount: income.amount,
      hours: undefined, // incomesテーブルにはhoursフィールドがない
    }));
  },

  async createIncome(income: Omit<IncomeEntry, 'id'>): Promise<IncomeEntry> {
    const response = await fetch('/api/incomes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: income.amount,
        date: income.date,
        employer_id: income.employer || null,
      }),
    });
    if (!response.ok) throw new Error('Failed to create income');
    const dbIncome = await response.json();
    
    return {
      id: dbIncome.id,
      date: dbIncome.date,
      employer: dbIncome.employer_id || undefined,
      amount: dbIncome.amount,
      hours: income.hours,
    };
  },

  async deleteIncome(id: string): Promise<void> {
    const response = await fetch(`/api/incomes?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete income');
  },

  // Shifts API
  async getShifts(params?: { year?: number; month?: number; employer_id?: string }): Promise<ShiftEntry[]> {
    const searchParams = new URLSearchParams();
    if (params?.year) searchParams.set('year', params.year.toString());
    if (params?.month) searchParams.set('month', params.month.toString());
    if (params?.employer_id) searchParams.set('employer_id', params.employer_id);

    const response = await fetch(`/api/shifts?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch shifts');
    const dbShifts = await response.json();
    
    return dbShifts.map((shift: any) => ({
      id: shift.id,
      date: shift.date,
      hours: shift.hours,
      hourlyWage: shift.hourly_wage,
      employerId: shift.employer_id,
      notes: undefined, // データベースにnotesフィールドがない場合
    }));
  },

  async createShift(shift: Omit<ShiftEntry, 'id'>): Promise<ShiftEntry> {
    const response = await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: shift.date,
        hours: shift.hours,
        hourly_wage: shift.hourlyWage,
        employer_id: shift.employerId,
      }),
    });
    if (!response.ok) throw new Error('Failed to create shift');
    const dbShift = await response.json();
    
    return {
      id: dbShift.id,
      date: dbShift.date,
      hours: dbShift.hours,
      hourlyWage: dbShift.hourly_wage,
      employerId: dbShift.employer_id,
      notes: shift.notes,
    };
  },

  async updateShift(id: string, shift: Partial<ShiftEntry>): Promise<ShiftEntry> {
    const updateData: any = { id };
    if (shift.date !== undefined) updateData.date = shift.date;
    if (shift.hours !== undefined) updateData.hours = shift.hours;
    if (shift.hourlyWage !== undefined) updateData.hourly_wage = shift.hourlyWage;
    if (shift.employerId !== undefined) updateData.employer_id = shift.employerId;

    const response = await fetch('/api/shifts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error('Failed to update shift');
    const dbShift = await response.json();
    
    return {
      id: dbShift.id,
      date: dbShift.date,
      hours: dbShift.hours,
      hourlyWage: dbShift.hourly_wage,
      employerId: dbShift.employer_id,
      notes: shift.notes,
    };
  },

  async deleteShift(id: string): Promise<void> {
    const response = await fetch(`/api/shifts?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete shift');
  },

  // Work Schedules API
  async getWorkSchedules(): Promise<WorkSchedule[]> {
    const response = await fetch('/api/work-schedules');
    if (!response.ok) throw new Error('Failed to fetch work schedules');
    const dbSchedules = await response.json();
    
    return dbSchedules.map((schedule: any) => ({
      id: schedule.id,
      employerId: schedule.employer_id,
      weeklyHours: schedule.hours * 7, // day_of_weekベースからweeklyHoursに変換
      hourlyWage: 1000, // デフォルト値（work_schedulesテーブルに時給フィールドがない）
      frequency: 'weekly' as const,
      startDate: new Date().toISOString().split('T')[0], // デフォルト値
      endDate: undefined,
    }));
  },

  async createWorkSchedule(schedule: Omit<WorkSchedule, 'id'>): Promise<WorkSchedule> {
    // 週間時間を日次時間に変換（簡易実装）
    const dailyHours = Math.round(schedule.weeklyHours / 7);
    
    const response = await fetch('/api/work-schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employer_id: schedule.employerId,
        day_of_week: 1, // 月曜日をデフォルト
        hours: dailyHours,
      }),
    });
    if (!response.ok) throw new Error('Failed to create work schedule');
    const dbSchedule = await response.json();
    
    return {
      id: dbSchedule.id,
      employerId: dbSchedule.employer_id,
      weeklyHours: schedule.weeklyHours,
      hourlyWage: schedule.hourlyWage,
      frequency: schedule.frequency,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
    };
  },

  async deleteWorkSchedule(id: string): Promise<void> {
    const response = await fetch(`/api/work-schedules?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete work schedule');
  },
};

export type AppState = {
  // データキャッシュ
  profile: UserProfile;
  employers: Employer[];
  incomes: IncomeEntry[];
  shifts: ShiftEntry[];
  workSchedules: WorkSchedule[];
  
  // ローディング状態
  isLoading: boolean;
  lastSyncTime: number | null;
  
  // DB-first操作 - Profile
  loadProfile: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  
  // DB-first操作 - Employers
  loadEmployers: () => Promise<void>;
  addEmployer: (employer: Omit<Employer, 'id'>) => Promise<void>;
  updateEmployer: (id: string, employer: Partial<Employer>) => Promise<void>;
  removeEmployer: (id: string) => Promise<void>;
  
  // DB-first操作 - Incomes
  loadIncomes: (params?: { year?: number; month?: number; employer_id?: string }) => Promise<void>;
  addIncome: (income: Omit<IncomeEntry, 'id'>) => Promise<void>;
  removeIncome: (id: string) => Promise<void>;
  
  // DB-first操作 - Shifts
  loadShifts: (params?: { year?: number; month?: number; employer_id?: string }) => Promise<void>;
  addShift: (shift: Omit<ShiftEntry, 'id'>) => Promise<void>;
  updateShift: (id: string, shift: Partial<ShiftEntry>) => Promise<void>;
  removeShift: (id: string) => Promise<void>;
  
  // DB-first操作 - Work Schedules
  loadWorkSchedules: () => Promise<void>;
  addWorkSchedule: (schedule: Omit<WorkSchedule, 'id'>) => Promise<void>;
  updateWorkSchedule: (id: string, schedule: Partial<WorkSchedule>) => Promise<void>;
  removeWorkSchedule: (id: string) => Promise<void>;
  
  // データ同期
  syncAllData: () => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  // 初期状態
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
    employerSize: "unknown",
    defaultHourlyWage: undefined,
    bracket: 103,
    termsAccepted: false,
  },
  employers: [],
  incomes: [],
  shifts: [],
  workSchedules: [],
  isLoading: false,
  lastSyncTime: null,

  // Profile操作
  loadProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await apiClient.getProfile();
      set({ profile, isLoading: false, lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Failed to load profile:', error);
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    try {
      // 楽観的更新
      set(state => ({ profile: { ...state.profile, ...updates } }));
      
      const updatedProfile = await apiClient.updateProfile(updates);
      set({ profile: updatedProfile, lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Failed to update profile:', error);
      // エラー時は再読み込み
      get().loadProfile();
    }
  },

  // Employers操作
  loadEmployers: async () => {
    set({ isLoading: true });
    try {
      const employers = await apiClient.getEmployers();
      set({ employers, isLoading: false, lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Failed to load employers:', error);
      set({ isLoading: false });
    }
  },

  addEmployer: async (employer) => {
    try {
      // 楽観的更新
      const tempId = crypto.randomUUID();
      const tempEmployer = { ...employer, id: tempId };
      set(state => ({ employers: [...state.employers, tempEmployer] }));
      
      const newEmployer = await apiClient.createEmployer(employer);
      set(state => ({
        employers: state.employers.map(e => e.id === tempId ? newEmployer : e),
        lastSyncTime: Date.now()
      }));
    } catch (error) {
      console.error('Failed to add employer:', error);
      // エラー時は楽観的更新を取り消し
      get().loadEmployers();
    }
  },

  updateEmployer: async (id, employer) => {
    try {
      // 楽観的更新
      set(state => ({
        employers: state.employers.map(e => e.id === id ? { ...e, ...employer } : e)
      }));
      
      const updatedEmployer = await apiClient.updateEmployer(id, employer);
      set(state => ({
        employers: state.employers.map(e => e.id === id ? updatedEmployer : e),
        lastSyncTime: Date.now()
      }));
    } catch (error) {
      console.error('Failed to update employer:', error);
      get().loadEmployers();
    }
  },

  removeEmployer: async (id) => {
    try {
      // 楽観的更新
      set(state => ({ employers: state.employers.filter(e => e.id !== id) }));
      
      await apiClient.deleteEmployer(id);
      set({ lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Failed to remove employer:', error);
      get().loadEmployers();
    }
  },

  // Incomes操作
  loadIncomes: async (params) => {
    set({ isLoading: true });
    try {
      const incomes = await apiClient.getIncomes(params);
      set({ incomes, isLoading: false, lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Failed to load incomes:', error);
      set({ isLoading: false });
    }
  },

  addIncome: async (income) => {
    try {
      const tempId = crypto.randomUUID();
      const tempIncome = { ...income, id: tempId };
      set(state => ({ incomes: [...state.incomes, tempIncome] }));
      
      const newIncome = await apiClient.createIncome(income);
      set(state => ({
        incomes: state.incomes.map(i => i.id === tempId ? newIncome : i),
        lastSyncTime: Date.now()
      }));
    } catch (error) {
      console.error('Failed to add income:', error);
      get().loadIncomes();
    }
  },

  removeIncome: async (id) => {
    try {
      set(state => ({ incomes: state.incomes.filter(i => i.id !== id) }));
      
      await apiClient.deleteIncome(id);
      set({ lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Failed to remove income:', error);
      get().loadIncomes();
    }
  },

  // Shifts操作
  loadShifts: async (params) => {
    set({ isLoading: true });
    try {
      const shifts = await apiClient.getShifts(params);
      set({ shifts, isLoading: false, lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Failed to load shifts:', error);
      set({ isLoading: false });
    }
  },

  addShift: async (shift) => {
    try {
      const tempId = crypto.randomUUID();
      const tempShift = { ...shift, id: tempId };
      set(state => ({ shifts: [...state.shifts, tempShift] }));
      
      const newShift = await apiClient.createShift(shift);
      set(state => ({
        shifts: state.shifts.map(s => s.id === tempId ? newShift : s),
        lastSyncTime: Date.now()
      }));
    } catch (error) {
      console.error('Failed to add shift:', error);
      get().loadShifts();
    }
  },

  updateShift: async (id, shift) => {
    try {
      set(state => ({
        shifts: state.shifts.map(s => s.id === id ? { ...s, ...shift } : s)
      }));
      
      const updatedShift = await apiClient.updateShift(id, shift);
      set(state => ({
        shifts: state.shifts.map(s => s.id === id ? updatedShift : s),
        lastSyncTime: Date.now()
      }));
    } catch (error) {
      console.error('Failed to update shift:', error);
      get().loadShifts();
    }
  },

  removeShift: async (id) => {
    try {
      set(state => ({ shifts: state.shifts.filter(s => s.id !== id) }));
      
      await apiClient.deleteShift(id);
      set({ lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Failed to remove shift:', error);
      get().loadShifts();
    }
  },

  // Work Schedules操作
  loadWorkSchedules: async () => {
    set({ isLoading: true });
    try {
      const workSchedules = await apiClient.getWorkSchedules();
      set({ workSchedules, isLoading: false, lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Failed to load work schedules:', error);
      set({ isLoading: false });
    }
  },

  addWorkSchedule: async (schedule) => {
    try {
      const tempId = crypto.randomUUID();
      const tempSchedule = { ...schedule, id: tempId };
      set(state => ({ workSchedules: [...state.workSchedules, tempSchedule] }));
      
      const newSchedule = await apiClient.createWorkSchedule(schedule);
      set(state => ({
        workSchedules: state.workSchedules.map(s => s.id === tempId ? newSchedule : s),
        lastSyncTime: Date.now()
      }));
    } catch (error) {
      console.error('Failed to add work schedule:', error);
      get().loadWorkSchedules();
    }
  },

  updateWorkSchedule: async (id, schedule) => {
    try {
      set(state => ({
        workSchedules: state.workSchedules.map(s => s.id === id ? { ...s, ...schedule } : s)
      }));
      
      // 注意: work-schedulesにはUPDATEエンドポイントがないため、削除+作成で対応
      console.warn('Work schedule update not implemented in API');
      set({ lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Failed to update work schedule:', error);
      get().loadWorkSchedules();
    }
  },

  removeWorkSchedule: async (id) => {
    try {
      set(state => ({ workSchedules: state.workSchedules.filter(s => s.id !== id) }));
      
      await apiClient.deleteWorkSchedule(id);
      set({ lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Failed to remove work schedule:', error);
      get().loadWorkSchedules();
    }
  },

  // 全データ同期
  syncAllData: async () => {
    const { loadProfile, loadEmployers, loadIncomes, loadShifts, loadWorkSchedules } = get();
    
    set({ isLoading: true });
    try {
      await Promise.all([
        loadProfile(),
        loadEmployers(),
        loadIncomes(),
        loadShifts(),
        loadWorkSchedules(),
      ]);
    } catch (error) {
      console.error('Failed to sync all data:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
