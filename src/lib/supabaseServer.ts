import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from './env';

type CookieStoreLike = {
  get: (name: string) => { value?: string } | undefined;
  set?: (name: string, value: string, options?: Record<string, unknown>) => void;
};

export function createSupabaseServerClient() {
  const cookieStore = cookies() as unknown as CookieStoreLike;
  const { url: supabaseUrl, anon: supabaseAnonKey } = getSupabaseEnv();

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
