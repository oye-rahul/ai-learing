const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseServiceKey);

if (!isSupabaseConfigured) {
  console.log('⚠️  Supabase not configured. Using SQLite fallback.');
  console.log('   To use Supabase, add SUPABASE_URL and SUPABASE_SERVICE_KEY to .env');
}

// Create Supabase client (service role for backend operations)
const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Create public client (for frontend if needed)
const supabasePublic = isSupabaseConfigured && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

module.exports = {
  supabase,
  supabasePublic,
  isSupabaseConfigured,
  supabaseUrl,
};
