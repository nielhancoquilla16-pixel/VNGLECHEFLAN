import { createClient } from '@supabase/supabase-js';

// fall back to hard‑coded values if env vars are missing (helps during development)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ||
  'https://sjdtxefyhbfrjggrhamg.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqZHR4ZWZ5aGJmcmpnZ3JoYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDQ2MDksImV4cCI6MjA4ODEyMDYwOX0.a3eWcRX365XB-xH2gv8_x7_Iwizk64tthfrqyondeew';

// create and export a single client instance for the app to use
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
