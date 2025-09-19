import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from './env';

type CookieStoreLike = {
  get: (name: string) => { value?: string } | undefined;
  set?: (name: string, value: string, options?: Record<string, unknown>) => void;
};

export function createSupabaseServerClient() {
  const cookieStore = cookies() as unknown as CookieStoreLike;
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseEnv();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        try {
          return cookieStore.get(name)?.value;
        } catch {
          return undefined;
        }
      },
      set(name: string, value: string, options?: Record<string, unknown>) {
        try {
          cookieStore.set?.(name, value, options);
        } catch {
          // no-op
        }
      },
      remove(name: string, options?: Record<string, unknown>) {
        try {
          cookieStore.set?.(name, '', { ...options, maxAge: 0 });
        } catch {
          // no-op
        }
      },
    },
  });
}

/**
 * Service Role権限でSupabaseクライアントを作成
 * データベース関数の実行やAdmin操作に使用
 */
export function createSupabaseServiceClient() {
  const { url: supabaseUrl } = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
