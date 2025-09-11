// Supabase型定義をインポート
import type { 
  Database, 
  AppProfile, 
  AppProfileInsert, 
  AppProfileUpdate,
  AppEmployer,
  AppEmployerInsert,
  AppEmployerUpdate,
  AppIncome,
  AppIncomeInsert,
  AppIncomeUpdate,
  AppShift,
  AppShiftInsert,
  AppShiftUpdate,
  AppWorkSchedule,
  AppWorkScheduleInsert,
  AppWorkScheduleUpdate
} from './supabase';

// === 基本型定義 ===
export type EmployerSize = "small" | "medium" | "large" | "unknown";
export type StudentType = "daytime" | "evening" | "correspondence" | "leave" | "graduate";
export type InsuranceType = "parent_dependent" | "national_health" | "employee_health" | "none";
export type ParentInsuranceType = "health_union" | "national_health" | "other";
export type LivingStatus = "living_together" | "living_separately";
export type BracketType = 103 | 130 | 150;

// === Supabase型定義の再エクスポート ===
export type { Database };

// データベーステーブル型（Supabaseから生成）
export type Profile = AppProfile;
export type ProfileInsert = AppProfileInsert;
export type ProfileUpdate = AppProfileUpdate;

export type SupabaseEmployer = AppEmployer;
export type SupabaseEmployerInsert = AppEmployerInsert;
export type SupabaseEmployerUpdate = AppEmployerUpdate;

export type Income = AppIncome;
export type IncomeInsert = AppIncomeInsert;
export type IncomeUpdate = AppIncomeUpdate;

export type Shift = AppShift;
export type ShiftInsert = AppShiftInsert;
export type ShiftUpdate = AppShiftUpdate;

export type SupabaseWorkSchedule = AppWorkSchedule;
export type SupabaseWorkScheduleInsert = AppWorkScheduleInsert;
export type SupabaseWorkScheduleUpdate = AppWorkScheduleUpdate;

// 型エイリアス（routing.tsとの互換性のため）
export type WorkShift = Shift;
export type WorkScheduleType = WorkSchedule;

// === アプリケーション固有の型定義（Supabase型をベースに拡張） ===

// Employer型（既存コードとの互換性を保ちつつSupabase型を拡張）
export interface Employer {
  // Supabaseベースフィールド
  id: string;
  name: string;
  hourly_wage?: number | null;
  size?: string | null;
  
  // フロントエンド固有のプロパティ（計算用・表示用）
  weeklyHours: number; // 必須
  monthlyIncome: number; // 必須
  commutingAllowance: number; // 必須
  bonus: number; // 必須
  employerSize?: EmployerSize;
}

// UserProfile型（既存コードとの互換性を保ちつつSupabase型をベース化）
export interface UserProfile {
  // 基本識別情報
  id?: string;
  
  // Supabaseベースフィールド（snake_case形式）
  birth_date?: string | null;
  bracket?: number | null;
  default_hourly_wage?: number | null;
  display_name?: string | null;
  employer_size?: string | null;
  grade?: string | null;
  insurance_status?: string | null;
  is_parent_dependent?: boolean | null;
  living_status?: string | null;
  monthly_allowance?: number | null;
  onboarding_completed?: boolean;
  other_income?: number | null;
  parent_insurance_type?: string | null;
  residence_city?: string | null;
  student_type?: string | null;
  terms_accepted?: boolean;
  
  // 既存のcamelCase形式（互換性維持）
  birthDate?: string;
  studentType?: StudentType;
  residenceCity?: string;
  insuranceStatus?: InsuranceType;
  parentInsuranceType?: ParentInsuranceType;
  livingStatus?: LivingStatus;
  monthlyAllowance?: number;
  otherIncome?: number;
  isParentDependent?: boolean;
  employerSize?: EmployerSize;
  defaultHourlyWage?: number;
  termsAccepted?: boolean;
  
    // フロントエンド固有のプロパティ
  employers?: Employer[]; // オプショナルプロパティ
}

// IncomeEntry型（既存コードとの互換性を保ちつつSupabase型をベース化）
export interface IncomeEntry {
  // Supabaseベースフィールド
  id: string;
  amount: number;
  date: string;
  employer_id?: string | null;
  source?: string | null;
  
  // フロントエンド固有のプロパティ
  employer?: string | undefined; // 表示用雇用者名
  hours?: number | undefined; // 勤務時間（画面で使用）
}

// ShiftEntry型（既存コードとの互換性を保ちつつSupabase型をベース化）
export interface ShiftEntry {
  // Supabaseベースフィールド
  id: string;
  date: string;
  employer_id?: string;
  hourly_wage?: number | null;
  hours: number;
  
  // 既存のcamelCase形式（互換性維持）
  employerId?: string;
  hourlyWage?: number;
  
  // フロントエンド固有のプロパティ
  notes?: string; // メモ（将来的にDBに追加予定）
}

// WorkSchedule型（既存コードとの互換性を保ちつつSupabase型をベース化）
export interface WorkSchedule {
  // Supabaseベースフィールド
  id: string;
  day_of_week?: number;
  employer_id?: string;
  hours?: number;
  
  // 既存のcamelCase形式（互換性維持）
  employerId?: string;
  weeklyHours: number; // 必須
  hourlyWage: number; // 必須
  frequency?: 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
}

// === その他の型定義 ===

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

// === 型変換ヘルパー関数 ===

// Bracket値の定数
export const BRACKET_103 = 103;
export const BRACKET_130 = 130;
export const BRACKET_150 = 150;

// Supabaseのbracket値をBracketTypeに変換
export function toBracketType(bracket: number | null | undefined): BracketType {
  if (bracket === BRACKET_103 || bracket === BRACKET_130 || bracket === BRACKET_150) {
    return bracket;
  }
  return BRACKET_103; // デフォルト値
}

// BracketTypeをSupabaseのnumber値に変換
export function toSupabaseBracket(bracket: BracketType): number {
  return bracket;
}
