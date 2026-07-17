"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserAndOrg } from "@/lib/supabase/org";

export async function createPurchaseOrder(formData: FormData) {
  const supabase = await createClient();
  const { user, organizationId } = await requireUserAndOrg(supabase);

  const { error } = await supabase.from("purchase_orders").insert({
    vendor_name: String(formData.get("vendor_name") ?? ""),
    item_name: String(formData.get("item_name") ?? ""),
    ordered_at: String(formData.get("ordered_at") ?? "") || new Date().toISOString().slice(0, 10),
    due_date: String(formData.get("due_date") ?? "") || null,
    amount: Number(formData.get("amount") ?? 0),
    arrival_status: "pending",
    payment_status: "unpaid",
    created_by: user.id,
    organization_id: organizationId,
  });

  if (error) {
    redirect(`/purchases/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/purchases");
  redirect("/purchases");
}

export async function updateArrivalStatus(id: string, arrivalStatus: string) {
  const supabase = await createClient();
  await supabase.from("purchase_orders").update({ arrival_status: arrivalStatus }).eq("id", id);
  revalidatePath("/purchases");
}

export async function deletePurchaseOrder(id: string) {
  const supabase = await createClient();
  await supabase.from("purchase_orders").delete().eq("id", id);
  revalidatePath("/purchases");
  redirect("/purchases");
}
