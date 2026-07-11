// config.js
// ⚠️ REPLACE THESE WITH YOUR ACTUAL SUPABASE KEYS ⚠️
const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co'; 
const SUPABASE_ANON_KEY = 'your-real-anon-key-here';        

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);