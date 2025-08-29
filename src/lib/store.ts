import { create } from "zustand";

export type EmployerSize = "small" | "medium" | "large" | "unknown";

export type UserProfile = {
	grade?: string;
	isParentDependent?: boolean;
	employerSize?: EmployerSize;
	defaultHourlyWage?: number; // 円/時
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
};

export const useAppStore = create<AppState>((set) => ({
	profile: {
		grade: undefined,
		isParentDependent: undefined,
		employerSize: "unknown",
		defaultHourlyWage: undefined,
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
}));


