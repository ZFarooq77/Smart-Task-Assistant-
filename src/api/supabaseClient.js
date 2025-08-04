// src/api/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Get from Supabase dashboard → Project Settings → API
const SUPABASE_URL = "https://fzktdpjtstaxchhckniw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a3RkcGp0c3RheGNoaGNrbml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDk4NTYsImV4cCI6MjA2ODkyNTg1Nn0.vqKcJIIJuW9ind_dETui_1DIHC7ozhjucX9h0l9dMU8"; // NOT service_role key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
