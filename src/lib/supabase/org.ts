import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function requireUserAndOrg(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    // Shouldn't normally happen (the signup trigger always assigns an org),
    // but fail safe rather than let inserts go through with a null org_id.
    redirect("/login?error=" + encodeURIComponent("組織情報が見つかりません。管理者にお問い合わせください。"));
  }

  return { user, organizationId: profile.organization_id as string };
}
