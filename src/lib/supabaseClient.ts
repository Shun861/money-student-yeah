import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

let browserClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
	if (browserClient) return browserClient as SupabaseClient;
	const { url, anon } = getSupabaseEnv();
	if (!url || !anon) {
		throw new Error('Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
	}
				browserClient = createBrowserClient(url, anon) as unknown as SupabaseClient;
	return browserClient as SupabaseClient;
}
