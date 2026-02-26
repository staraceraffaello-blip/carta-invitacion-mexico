import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client con service_role key — solo para uso en server (Vercel Functions)
// Nunca exponer en el frontend
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
