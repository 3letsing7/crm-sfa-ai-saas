import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY. This bypasses Row Level Security entirely.
// Only use it from trusted backend code with no user session
// available — e.g. the Stripe webhook handler. Never expose the
// service role key to the browser (no NEXT_PUBLIC_ prefix).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
