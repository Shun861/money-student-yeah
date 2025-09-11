import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

// createBrowserClientの返り値型を正確に使用
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient(): ReturnType<typeof createBrowserClient> {
	if (browserClient) return browserClient;
	const { url, anonKey } = getSupabaseEnv();
	if (!url || !anonKey) {
		throw new Error('Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
	}
	browserClient = createBrowserClient(url, anonKey);
	return browserClient;
}
