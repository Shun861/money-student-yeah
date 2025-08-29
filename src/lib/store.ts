import { create } from "zustand";

export type EmployerSize = "small" | "medium" | "large" | "unknown";

export type StudentType = "daytime" | "evening" | "correspondence" | "leave" | "graduate";
export type InsuranceType = "parent_dependent" | "national_health" | "employee_health" | "none";
export type ParentInsuranceType = "health_union" | "national_health" | "other";
export type LivingStatus = "living_together" | "living_separately";

export interface Employer {
  id: string;
  name: string;
  weeklyHours: number;
  monthlyIncome: number;
  commutingAllowance: number;
  bonus: number;
  employerSize: EmployerSize;
}

export type UserProfile = {
	// 基本情報
	birthDate?: string; // YYYY-MM-DD
	studentType?: StudentType;
	residenceCity?: string;
	
	// 保険情報
	insuranceStatus?: InsuranceType;
	parentInsuranceType?: ParentInsuranceType;
	livingStatus?: LivingStatus;
	monthlyAllowance?: number; // 別居時の仕送り額
	
	// 収入情報
	employers: Employer[];
	otherIncome?: number; // 給与以外の所得
	
	// 既存項目
	grade?: string;
	isParentDependent?: boolean;
	employerSize?: EmployerSize;
	defaultHourlyWage?: number; // 円/時
    bracket?: 103 | 130 | 150;
};

export type IncomeEntry = {
	id: string;
	date: string; // YYYY-MM-DD
	employer?: string;
	amount: number; // 円（手取り/総支給はMVPでは総額入力）
};

export type ShiftEntry = {
	id: string;
	date: string; // YYYY-MM-DD
	hours: number; // 勤務予定時間
	hourlyWage?: number; // 未指定なら profile.defaultHourlyWage を使用
};

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


