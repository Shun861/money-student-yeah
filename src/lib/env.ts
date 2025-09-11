/**
 * 環境変数の型定義
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface AppConfig {
  supabase: SupabaseConfig;
  nodeEnv: 'development' | 'production' | 'test';
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}

/**
 * 環境変数バリデーションエラー
 */
export class EnvironmentValidationError extends Error {
  constructor(message: string, public missingVars: string[]) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

/**
 * 必須環境変数の検証とSupabase設定の取得
 * 環境変数が不足している場合はエラーを投げる
 */
export function getSupabaseEnv(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  // 必須チェック
  if (!url || url.trim() === '') {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!anonKey || anonKey.trim() === '') {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // フォーマットチェック
  if (url && (!url.startsWith('https://') || !url.includes('.supabase.co'))) {
    invalidVars.push('NEXT_PUBLIC_SUPABASE_URL (invalid format)');
  }

  if (anonKey && anonKey.length < 50) {
    invalidVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY (too short)');
  }

  const allErrors = [...missingVars, ...invalidVars];

  if (allErrors.length > 0) {
    const errorMessage = `Environment validation failed: ${allErrors.join(', ')}`;
    
    // 開発環境でも厳密チェック（Issue #46対応）
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
      throw new EnvironmentValidationError(errorMessage, allErrors);
    } else {
      console.warn(`⚠️  [ENV WARNING] ${errorMessage}`);
      console.warn('⚠️  [ENV WARNING] Application may not function correctly in production.');
      
      // 開発環境では空文字列で継続（下位互換性のため）
      return { 
        url: url ?? '', 
        anonKey: anonKey ?? '' 
      };
    }
  }

  return { url: url!, anonKey: anonKey! };
}

/**
 * アプリケーション起動時の環境変数検証
 * 必須の環境変数が不足している場合は例外を投げる
 */
export function validateEnvironment(): void {
  try {
    // Supabase設定の検証
    getSupabaseEnv();
    console.log('✅ Environment validation passed');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    throw error;
  }
}

/**
 * 環境別設定チェック（Issue #46対応）
 */
export interface EnvironmentStatus {
  isValid: boolean;
  environment: 'development' | 'production' | 'test';
  platform: 'local' | 'vercel' | 'unknown';
  missingVars: string[];
  optionalVars: { name: string; configured: boolean }[];
  warnings: string[];
}

export function checkEnvironmentStatus(): EnvironmentStatus {
  const environment = process.env.NODE_ENV === 'production' ? 'production' 
                    : process.env.NODE_ENV === 'test' ? 'test'
                    : 'development';
  
  const platform = process.env.VERCEL === '1' ? 'vercel'
                  : process.env.NODE_ENV === 'test' ? 'unknown'
                  : 'local';

  const missingVars: string[] = [];
  const warnings: string[] = [];

  // 必須変数チェック
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  required.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // オプション変数チェック
  const optional = [
    'NEXT_PUBLIC_SENTRY_DSN',
    'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    'E2E_TEST_EMAIL',
    'E2E_TEST_PASSWORD'
  ];

  const optionalVars = optional.map(name => ({
    name,
    configured: !!process.env[name]
  }));

  // 環境特有の警告
  if (environment === 'production' && platform === 'vercel') {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      warnings.push('Sentry DSN not configured for production error tracking');
    }
    if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      warnings.push('Google Analytics not configured for production');
    }
  }

  if (environment === 'test') {
    if (!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD) {
      warnings.push('E2E test credentials not configured');
    }
  }

  return {
    isValid: missingVars.length === 0,
    environment,
    platform,
    missingVars,
    optionalVars,
    warnings
  };
}
