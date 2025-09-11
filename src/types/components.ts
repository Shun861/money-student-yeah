// === Next.js 15 型安全なページコンポーネント定義 ===
// Issue #48: フェーズ4 - Next.js型機能の活用

import type { Metadata, Viewport } from 'next';
import type { 
  BasePageProps,
  DashboardPageProps,
  IncomePageProps,
  WorkPageProps,
  ProfilePageProps,
  SimulationPageProps,
  PredictionPageProps,
  GenerateMetadata,
  ErrorPageProps,
  NotFoundPageProps
} from './routing';

// === ページコンポーネントの基本型 ===

// 通常のページコンポーネント型
export type PageComponent<T extends BasePageProps = BasePageProps> = (props: T) => React.ReactElement | Promise<React.ReactElement>;

// レイアウトコンポーネント型
export type LayoutComponent<T extends BasePageProps = BasePageProps> = (
  props: T & { children: React.ReactNode }
) => React.ReactElement | Promise<React.ReactElement>;

// === 各ページコンポーネントの具体的な型 ===

// ダッシュボードページ
export type DashboardPage = PageComponent<DashboardPageProps>;
export type DashboardMetadata = GenerateMetadata<DashboardPageProps>;

// 収入管理ページ
export type IncomePage = PageComponent<IncomePageProps>;
export type IncomeMetadata = GenerateMetadata<IncomePageProps>;

// 勤務管理ページ
export type WorkPage = PageComponent<WorkPageProps>;
export type WorkMetadata = GenerateMetadata<WorkPageProps>;

// プロフィールページ
export type ProfilePage = PageComponent<ProfilePageProps>;
export type ProfileMetadata = GenerateMetadata<ProfilePageProps>;

// シミュレーションページ
export type SimulationPage = PageComponent<SimulationPageProps>;
export type SimulationMetadata = GenerateMetadata<SimulationPageProps>;

// 予測ページ
export type PredictionPage = PageComponent<PredictionPageProps>;
export type PredictionMetadata = GenerateMetadata<PredictionPageProps>;

// === エラーページコンポーネント型 ===

// エラー境界コンポーネント
export type ErrorPage = (props: ErrorPageProps) => React.ReactElement;

// 404ページ
export type NotFoundPage = (props: NotFoundPageProps) => React.ReactElement;

// === レイアウトコンポーネント型 ===

// メインレイアウト
export type RootLayout = LayoutComponent<{ params: {}; searchParams: {} }>;

// 認証レイアウト
export type AuthLayout = LayoutComponent<{ params: {}; searchParams: {} }>;

// ダッシュボードレイアウト
export type DashboardLayout = LayoutComponent<{ params: {}; searchParams: {} }>;

// マーケティングレイアウト
export type MarketingLayout = LayoutComponent<{ params: {}; searchParams: {} }>;

// === サーバーコンポーネント専用型 ===

// サーバーアクション結果型
export type ServerActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  redirect?: string;
};

// サーバーコンポーネントのプロップス型
export type ServerComponentProps<T extends BasePageProps = BasePageProps> = T & {
  // サーバーサイドでのみ利用可能なデータ
  userAgent?: string;
  ip?: string;
  headers?: Headers;
};

// === クライアントコンポーネント型 ===

// クライアント専用コンポーネント基本型
export type ClientComponent<T = {}> = (props: T) => React.ReactElement;

// インタラクティブコンポーネント型
export type InteractiveComponent<T = {}> = ClientComponent<T & {
  onAction?: (action: string, data?: any) => void;
  loading?: boolean;
  disabled?: boolean;
}>;

// === フォームコンポーネント型 ===

// フォームコンポーネント基本型
export type FormComponent<T = {}> = ClientComponent<{
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  defaultValues?: Partial<T>;
  loading?: boolean;
  errors?: Record<keyof T, string>;
}>;

// フォームフィールドコンポーネント型
export type FormFieldComponent<T = any> = ClientComponent<{
  name: string;
  label: string;
  value?: T;
  onChange: (value: T) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  description?: string;
}>;

// === データ取得コンポーネント型 ===

// データローダーコンポーネント型
export type DataLoaderComponent<T = any> = ServerComponentProps<BasePageProps> & {
  loader: () => Promise<T>;
  fallback?: React.ReactElement;
  error?: React.ReactElement;
  children: (data: T) => React.ReactElement;
};

// リストコンポーネント型
export type ListComponent<T = any> = ClientComponent<{
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  loading?: boolean;
  empty?: React.ReactElement;
  error?: React.ReactElement;
  onLoadMore?: () => void;
  hasMore?: boolean;
}>;

// === モーダル・オーバーレイコンポーネント型 ===

// モーダルコンポーネント型
export type ModalComponent<T = {}> = ClientComponent<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
} & T>;

// ドロワーコンポーネント型
export type DrawerComponent<T = {}> = ClientComponent<{
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  children: React.ReactNode;
} & T>;

// === 条件レンダリングコンポーネント型 ===

// 認証ガードコンポーネント型
export type AuthGuardComponent = ClientComponent<{
  children: React.ReactNode;
  fallback?: React.ReactElement;
  requireAuth?: boolean;
  requiredRoles?: string[];
}>;

// 権限チェックコンポーネント型
export type PermissionComponent = ClientComponent<{
  children: React.ReactNode;
  fallback?: React.ReactElement;
  permissions: string[];
  requireAll?: boolean;
}>;

// === フック型定義 ===

// データフェッチフック型
export type DataFetchHook<T = any> = () => {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

// フォーム管理フック型
export type FormHook<T = any> = () => {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => Promise<void>;
  reset: (values?: Partial<T>) => void;
};

// === 型安全性ユーティリティ ===

// コンポーネントのプロップス型を取得
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

// レンダープロップ型
export type RenderProp<T = any> = (data: T) => React.ReactElement;

// 子要素関数型
export type ChildrenFunction<T = any> = (data: T) => React.ReactNode;

// === Next.js 15 固有の型 ===

// App Router メタデータ生成型
export type DynamicMetadata<T extends BasePageProps = BasePageProps> = (
  props: T,
  parent?: Promise<Metadata>
) => Promise<Metadata> | Metadata;

// App Router ビューポート生成型
export type DynamicViewport<T extends BasePageProps = BasePageProps> = (
  props: T,
  parent?: Promise<Viewport>
) => Promise<Viewport> | Viewport;

// Parallel Routes 型
export type ParallelRoutes = {
  [key: string]: React.ReactNode;
};

// Intercepting Routes 型
export type InterceptingRoute<T extends BasePageProps = BasePageProps> = PageComponent<T>;

// === コンポーネント組み合わせ型 ===

// ページとレイアウトの組み合わせ型
export type PageWithLayout<P extends BasePageProps = BasePageProps> = {
  page: PageComponent<P>;
  layout?: LayoutComponent<P>;
  metadata?: GenerateMetadata<P>;
};

// 型安全なページ定義
export type TypeSafePage = {
  component: React.ComponentType<any>;
  props: BasePageProps;
  metadata?: Metadata;
  viewport?: Viewport;
};
