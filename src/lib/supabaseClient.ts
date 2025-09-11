import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

// createBrowserClientの実際の返り値型を使用
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
	if (browserClient) return browserClient;
	const { url, anon } = getSupabaseEnv();
	if (!url || !anon) {
		throw new Error('Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
	}
	browserClient = createBrowserClient(url, anon);
	return browserClient;
}
