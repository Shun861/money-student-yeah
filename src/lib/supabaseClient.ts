import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

const { url, anon } = getSupabaseEnv();
export const supabase = createClient(url, anon);
