import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl.startsWith('http') && supabaseAnonKey.length > 10;

if (!isConfigured) {
  console.warn(
    'Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env.local\n' +
    'The app will run in demo mode without database persistence.'
  );
}

// Create a real client or a dummy placeholder
export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key-that-wont-connect');

export const isSupabaseConfigured = isConfigured;
