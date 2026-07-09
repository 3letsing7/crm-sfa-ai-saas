"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createDeal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const customerId = String(formData.get("customer_id") ?? "");

  const { error } = await supabase.from("deals").insert({
    customer_id: customerId,
    title: String(formData.get("title") ?? ""),
    status: String(formData.get("status") ?? "lead"),
    amount: Number(formData.get("amount") ?? 0),
    close_date: String(formData.get("close_date") ?? "") || null,
    next_action: String(formData.get("next_action") ?? "") || null,
    assigned_to: user.id,
    created_by: user.id,
  });

  if (error) {
    redirect(`/deals/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/deals");
  revalidatePath(`/customers/${customerId}`);
  redirect("/deals");
}

export async function updateDealStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("deals").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/deals");
}
