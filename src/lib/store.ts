import { create } from "zustand";
import type { 
  UserProfile, 
  IncomeEntry, 
  ShiftEntry, 
  Employer 
} from "@/types";

export type AppState = {
	profile: UserProfile;
	incomes: IncomeEntry[];
	shifts: ShiftEntry[];

	setProfile: (partial: Partial<UserProfile>) => void;
	addIncome: (income: IncomeEntry) => void;
	removeIncome: (id: string) => void;
	addShift: (shift: ShiftEntry) => void;
	removeShift: (id: string) => void;
	
	// Employer管理
	addEmployer: (employer: Employer) => void;
	updateEmployer: (id: string, employer: Partial<Employer>) => void;
	removeEmployer: (id: string) => void;
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

	setProfile: (partial) =>
		set((state) => ({ profile: { ...state.profile, ...partial } })),
	addIncome: (income) =>
		set((state) => ({ incomes: [...state.incomes, income] })),
	removeIncome: (id) =>
		set((state) => ({ incomes: state.incomes.filter((i) => i.id !== id) })),
	addShift: (shift) => set((state) => ({ shifts: [...state.shifts, shift] })),
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
}));


