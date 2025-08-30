import { create } from "zustand";
import type { 
  UserProfile, 
  IncomeEntry, 
  ShiftEntry, 
  Employer,
  WorkSchedule
} from "@/types";

export type AppState = {
	profile: UserProfile;
	incomes: IncomeEntry[];
	shifts: ShiftEntry[];
	workSchedules: WorkSchedule[];

	setProfile: (partial: Partial<UserProfile>) => void;
	addIncome: (income: IncomeEntry) => void;
	removeIncome: (id: string) => void;
	addShift: (shift: ShiftEntry) => void;
	updateShift: (id: string, shift: Partial<ShiftEntry>) => void;
	removeShift: (id: string) => void;
	
	// Employer管理
	addEmployer: (employer: Employer) => void;
	updateEmployer: (id: string, employer: Partial<Employer>) => void;
	removeEmployer: (id: string) => void;
	
	// WorkSchedule管理
	addWorkSchedule: (schedule: WorkSchedule) => void;
	updateWorkSchedule: (id: string, schedule: Partial<WorkSchedule>) => void;
	removeWorkSchedule: (id: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
	profile: {
		// 基本情報
		birthDate: undefined,
		studentType: undefined,
		residenceCity: undefined,
		
		// 保険情報
		insuranceStatus: undefined,
		parentInsuranceType: undefined,
		livingStatus: undefined,
		monthlyAllowance: undefined,
		
		// 収入情報
		employers: [],
		otherIncome: undefined,
		
		// 既存項目
		grade: undefined,
		isParentDependent: undefined,
		employerSize: "unknown",
		defaultHourlyWage: undefined,
        bracket: 103,
	},
	incomes: [],
	shifts: [],
	workSchedules: [],

	setProfile: (partial) =>
		set((state) => ({ profile: { ...state.profile, ...partial } })),
	addIncome: (income) =>
		set((state) => ({ incomes: [...state.incomes, income] })),
	removeIncome: (id) =>
		set((state) => ({ incomes: state.incomes.filter((i) => i.id !== id) })),
	addShift: (shift) => set((state) => ({ shifts: [...state.shifts, shift] })),
	updateShift: (id, shift) =>
		set((state) => ({
			shifts: state.shifts.map((s) =>
				s.id === id ? { ...s, ...shift } : s
			)
		})),
	removeShift: (id) =>
		set((state) => ({ shifts: state.shifts.filter((s) => s.id !== id) })),
	
	// Employer管理
	addEmployer: (employer) =>
		set((state) => ({ 
			profile: { 
				...state.profile, 
				employers: [...state.profile.employers, employer] 
			} 
		})),
	updateEmployer: (id, employer) =>
		set((state) => ({
			profile: {
				...state.profile,
				employers: state.profile.employers.map((e) =>
					e.id === id ? { ...e, ...employer } : e
				)
			}
		})),
	removeEmployer: (id) =>
		set((state) => ({
			profile: {
				...state.profile,
				employers: state.profile.employers.filter((e) => e.id !== id)
			}
		})),
	
	// WorkSchedule管理
	addWorkSchedule: (schedule) =>
		set((state) => ({ workSchedules: [...state.workSchedules, schedule] })),
	updateWorkSchedule: (id, schedule) =>
		set((state) => ({
			workSchedules: state.workSchedules.map((s) =>
				s.id === id ? { ...s, ...schedule } : s
			)
		})),
	removeWorkSchedule: (id) =>
		set((state) => ({
			workSchedules: state.workSchedules.filter((s) => s.id !== id)
		})),
}));


