// 基本型定義
export type EmployerSize = "small" | "medium" | "large" | "unknown";
export type StudentType = "daytime" | "evening" | "correspondence" | "leave" | "graduate";
export type InsuranceType = "parent_dependent" | "national_health" | "employee_health" | "none";
export type ParentInsuranceType = "health_union" | "national_health" | "other";
export type LivingStatus = "living_together" | "living_separately";
export type BracketType = 103 | 130 | 150;

// エンティティ型定義
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
  bracket?: BracketType;
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

// 計算結果型定義
export type CalcResult = {
  totalIncomeYTD: number;
  remainingToLimit: number;
  percentUsed: number; // 0-100
  estimatedHoursLeftBy103: number; // using default hourly wage
  estimatedHoursLeftBy130: number;
};

// オプション型定義
export interface Option {
  value: string;
  label: string;
  description: string;
}

// ステップ型定義
export type Step = 1 | 2 | 3;
