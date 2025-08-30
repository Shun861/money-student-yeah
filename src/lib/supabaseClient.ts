import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
	if (client) return client;
	const { url, anon } = getSupabaseEnv();
	if (!url || !anon) {
		// Avoid crashing at build; only throw when actually used at runtime
		throw new Error('Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
	}
	client = createClient(url, anon);
	return client;
}
