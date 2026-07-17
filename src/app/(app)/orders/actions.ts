"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserAndOrg } from "@/lib/supabase/org";

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const { user, organizationId } = await requireUserAndOrg(supabase);

  const customerId = String(formData.get("customer_id") ?? "");
  const invoiceId = String(formData.get("invoice_id") ?? "") || null;

  const { error } = await supabase.from("orders").insert({
    customer_id: customerId,
    invoice_id: invoiceId,
    title: String(formData.get("title") ?? ""),
    ordered_at: String(formData.get("ordered_at") ?? "") || new Date().toISOString().slice(0, 10),
    due_date: String(formData.get("due_date") ?? "") || null,
    amount: Number(formData.get("amount") ?? 0),
    progress: "pending",
    created_by: user.id,
    organization_id: organizationId,
  });

  if (error) {
    redirect(`/orders/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/orders");
  redirect("/orders");
}

export async function updateOrderProgress(id: string, progress: string) {
  const supabase = await createClient();
  await supabase.from("orders").update({ progress }).eq("id", id);
  revalidatePath("/orders");
}

export async function deleteOrder(id: string) {
  const supabase = await createClient();
  await supabase.from("orders").delete().eq("id", id);
  revalidatePath("/orders");
  redirect("/orders");
}
