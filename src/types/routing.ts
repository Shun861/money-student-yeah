// === Next.js 15 App Router 型安全なルーティング ===
// Issue #48: フェーズ4 - Next.js型機能の活用

// === 動的ルート型定義 ===

// 基本的なページパラメータ型
export type BasePageProps = {
  params: Record<string, string | string[]>;
  searchParams: Record<string, string | string[] | undefined>;
};

// === 各ページの具体的なパラメータ型 ===

// ダッシュボードページ
export type DashboardPageProps = {
  params: {};
  searchParams: {
    tab?: 'overview' | 'income' | 'prediction';
    month?: string; // YYYY-MM format
    year?: string;  // YYYY format
  };
};

// 収入管理ページ
export type IncomePageProps = {
  params: {};
  searchParams: {
    employer?: string;
    month?: string;
    sort?: 'date' | 'amount' | 'employer';
    order?: 'asc' | 'desc';
    page?: string;
    limit?: string;
  };
};

// 勤務管理ページ
export type WorkPageProps = {
  params: {};
  searchParams: {
    employer?: string;
    schedule?: 'upcoming' | 'past' | 'all';
    view?: 'calendar' | 'list';
  };
};

// プロフィールページ
export type ProfilePageProps = {
  params: {};
  searchParams: {
    edit?: 'true';
    section?: 'basic' | 'tax' | 'preferences';
  };
};

// シミュレーションページ
export type SimulationPageProps = {
  params: {};
  searchParams: {
    scenario?: string;
    preset?: 'conservative' | 'moderate' | 'aggressive';
  };
};

// 予測ページ
export type PredictionPageProps = {
  params: {};
  searchParams: {
    range?: '3month' | '6month' | '1year';
    type?: 'income' | 'tax' | 'both';
  };
};

// === API エンドポイント型 ===

// 基本的なAPI レスポンス型
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// API エンドポイントの型マッピング
export type ApiEndpoints = {
  '/api/profile': {
    GET: ApiResponse<import('./index').UserProfile>;
    PUT: ApiResponse<import('./index').UserProfile>;
  };
  '/api/incomes': {
    GET: ApiResponse<import('./index').IncomeEntry[]>;
    POST: ApiResponse<import('./index').IncomeEntry>;
  };
  '/api/incomes/[id]': {
    GET: ApiResponse<import('./index').IncomeEntry>;
    PUT: ApiResponse<import('./index').IncomeEntry>;
    DELETE: ApiResponse<{ id: string }>;
  };
  '/api/employers': {
    GET: ApiResponse<import('./index').Employer[]>;
    POST: ApiResponse<import('./index').Employer>;
  };
  '/api/employers/[id]': {
    GET: ApiResponse<import('./index').Employer>;
    PUT: ApiResponse<import('./index').Employer>;
    DELETE: ApiResponse<{ id: string }>;
  };
  '/api/shifts': {
    GET: ApiResponse<import('./index').WorkShift[]>;
    POST: ApiResponse<import('./index').WorkShift>;
  };
  '/api/work-schedules': {
    GET: ApiResponse<import('./index').WorkScheduleType[]>;
    POST: ApiResponse<import('./index').WorkScheduleType>;
  };
};

// === ナビゲーション型 ===

// アプリ内のルート定義
export type AppRoutes = {
  // 認証関連
  login: '/login';
  resetPassword: '/reset-password';
  
  // ダッシュボード
  dashboard: '/dashboard';
  
  // メイン機能
  income: '/income';
  work: '/work';
  profile: '/profile';
  
  // 分析・予測
  simulation: '/simulation';
  prediction: '/prediction';
  
  // オンボーディング
  onboarding: '/onboarding';
  
  // その他
  apiTest: '/api-test';
  
  // マーケティング
  home: '/';
  privacy: '/privacy';
  terms: '/terms';
};

// ルートパラメータから型を推論するヘルパー
export type ExtractRouteParams<T extends string> = 
  T extends `${string}[${infer Param}]${infer Rest}`
    ? { [K in Param]: string } & ExtractRouteParams<Rest>
    : {};

// 動的ルートのパラメータ型
export type RouteParams<T extends keyof AppRoutes = keyof AppRoutes> = 
  T extends any 
    ? ExtractRouteParams<AppRoutes[T]>
    : never;

// === Link コンポーネント用の型安全性 ===

// Next.js Link コンポーネントの型安全なProps
export type SafeLinkProps = {
  href: AppRoutes[keyof AppRoutes];
  params?: Record<string, string>;
  searchParams?: Record<string, string>;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof import('next/link').default>, 'href'>;

// === メタデータ生成用の型 ===

// 各ページのメタデータ型
export type PageMetadata = {
  title: string;
  description: string;
  keywords?: string[];
  openGraph?: {
    title?: string;
    description?: string;
    images?: string[];
  };
  twitter?: {
    title?: string;
    description?: string;
    images?: string[];
  };
};

// 動的メタデータ生成関数の型
export type GenerateMetadata<T extends BasePageProps = BasePageProps> = (
  props: T
) => Promise<PageMetadata> | PageMetadata;

// === エラーページ型 ===

// error.tsx の props 型
export type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// not-found.tsx は props を受け取らない
export type NotFoundPageProps = {};

// === 検索パラメータユーティリティ型 ===

// 検索パラメータを型安全に解析するヘルパー
export type ParsedSearchParams<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends string[]
    ? string[]
    : T[K] extends string
    ? string | undefined
    : T[K] extends undefined
    ? undefined
    : string | string[] | undefined;
};

// 検索パラメータのバリデーション結果型
export type ValidatedSearchParams<T> = {
  success: boolean;
  data?: T;
  errors?: Record<keyof T, string>;
};

// === Middleware 型 ===

// middleware.ts で使用する型
export type MiddlewareConfig = {
  matcher: string | string[];
};

export type NextRequestWithAuth = import('next/server').NextRequest & {
  auth?: {
    user?: {
      id: string;
      email: string;
    };
  };
};

// === 型安全なルーティングヘルパー ===

// パラメータ付きルート生成
export type RouteBuilder<T extends string> = (
  params?: ExtractRouteParams<T>,
  searchParams?: Record<string, string>
) => string;

// ルート定義の型チェック
export type ValidateRoute<T extends string> = T extends AppRoutes[keyof AppRoutes] 
  ? T 
  : never;
