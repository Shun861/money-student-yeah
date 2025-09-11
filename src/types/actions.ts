// === Next.js 15 Server Actions 型定義 ===
// Issue #48: フェーズ4 - Next.js型機能の活用

import { z } from 'zod';

// サーバーアクション結果の基本型
export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

// === プロフィール関連のアクション型 ===
export const profileFormSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  studentId: z.string().optional(),
  dependentStatus: z.enum(['dependent', 'independent']),
  targetAnnualIncome: z.number().min(0).max(2000000, '年収目標は200万円以下で設定してください'),
  taxWithholdingPreference: z.enum(['automatic', 'manual']),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type UpdateProfileAction = (data: ProfileFormData) => Promise<ActionResult<ProfileFormData>>;

// === 収入関連のアクション型 ===
export const incomeFormSchema = z.object({
  employerId: z.string().uuid('有効な雇用者IDを選択してください'),
  amount: z.number().min(1, '金額は1円以上で入力してください').max(100000, '1回の収入は10万円以下で入力してください'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '有効な日付形式で入力してください'),
  taxWithheld: z.number().min(0).optional(),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
});

export type IncomeFormData = z.infer<typeof incomeFormSchema>;
export type CreateIncomeAction = (data: IncomeFormData) => Promise<ActionResult<IncomeFormData>>;
export type UpdateIncomeAction = (id: string, data: Partial<IncomeFormData>) => Promise<ActionResult<IncomeFormData>>;
export type DeleteIncomeAction = (id: string) => Promise<ActionResult<{ id: string }>>;

// === 勤務先関連のアクション型 ===
export const employerFormSchema = z.object({
  name: z.string().min(1, '勤務先名は必須です').max(100, '勤務先名は100文字以内で入力してください'),
  type: z.enum(['part_time', 'contract', 'freelance', 'other']),
  hourlyWage: z.number().min(100, '時給は100円以上で設定してください').max(5000, '時給は5000円以下で設定してください').optional(),
  taxWithholdingType: z.enum(['none', 'income_tax', 'both']),
  address: z.string().max(200, '住所は200文字以内で入力してください').optional(),
  contactPerson: z.string().max(50, '担当者名は50文字以内で入力してください').optional(),
  phone: z.string().regex(/^[\d-+()]*$/, '有効な電話番号形式で入力してください').optional(),
  email: z.string().email('有効なメールアドレスを入力してください').optional(),
});

export type EmployerFormData = z.infer<typeof employerFormSchema>;
export type CreateEmployerAction = (data: EmployerFormData) => Promise<ActionResult<EmployerFormData>>;
export type UpdateEmployerAction = (id: string, data: Partial<EmployerFormData>) => Promise<ActionResult<EmployerFormData>>;
export type DeleteEmployerAction = (id: string) => Promise<ActionResult<{ id: string }>>;

// === フォームステート型 ===
export type FormState<TData = any> = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: TData;
};

// === 一般的なアクション型 ===
export type ServerAction<TInput = any, TOutput = any> = (
  input: TInput
) => Promise<ActionResult<TOutput>>;

// バリデーション付きサーバーアクション型
export type ValidatedServerAction<TSchema extends z.ZodSchema> = (
  data: z.infer<TSchema>
) => Promise<ActionResult<z.infer<TSchema>>>;

// === ページパラメータ型 ===
export type PageParams = {
  params: Record<string, string | string[]>;
  searchParams: Record<string, string | string[] | undefined>;
};

// 動的ルート用のパラメータ型
export type DynamicPageParams<T extends string = string> = {
  params: { id: T };
  searchParams: Record<string, string | string[] | undefined>;
};

// === API レスポンス型 ===
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// === エラーハンドリング型 ===
export type ActionError = {
  code: string;
  message: string;
  field?: string;
};

export type ValidationErrors = Record<string, string[]>;

// === 非同期状態管理型 ===
export type AsyncState<T = any> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// 楽観的更新用の型
export type OptimisticAction<T> = {
  type: 'create' | 'update' | 'delete';
  id: string;
  data?: T;
};

// === フォームアクション用のユーティリティ型 ===
export type FormActionHandler<T> = (
  prevState: FormState<T>,
  formData: FormData
) => Promise<FormState<T>>;

// Zod スキーマからフォームアクションを作成するヘルパー型
export type SchemaFormAction<TSchema extends z.ZodSchema> = FormActionHandler<z.infer<TSchema>>;
