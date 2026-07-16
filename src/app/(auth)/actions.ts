"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function getSiteUrl() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;

  // Fallback for environments where the origin header isn't set (e.g. some server contexts)
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const orgMode = String(formData.get("org_mode") ?? "create");
  const companyName = String(formData.get("company_name") ?? "");
  const inviteCode = String(formData.get("invite_code") ?? "").trim();

  if (orgMode === "create" && !companyName) {
    redirect(`/signup?error=${encodeURIComponent("会社名を入力してください")}`);
  }
  if (orgMode === "join") {
    if (!inviteCode) {
      redirect(`/signup?error=${encodeURIComponent("招待コードを入力してください")}`);
    }
    const { data: match } = await supabase.rpc("lookup_organization_by_invite_code", {
      code: inviteCode,
    });
    if (!match || match.length === 0) {
      redirect(`/signup?error=${encodeURIComponent("招待コードが正しくありません")}`);
    }
  }

  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        org_mode: orgMode,
        company_name: companyName,
        invite_code: inviteCode,
      },
      emailRedirectTo: `${siteUrl}/login`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=confirmation-sent");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
