"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserAndOrg } from "@/lib/supabase/org";

export async function createExpense(formData: FormData) {
  const supabase = await createClient();
  const { organizationId } = await requireUserAndOrg(supabase);

  const purchaseOrderId = String(formData.get("purchase_order_id") ?? "") || null;
  const vendorName = String(formData.get("vendor_name") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const status = String(formData.get("status") ?? "unpaid");
  const paidAt = String(formData.get("paid_at") ?? "") || null;
  const method = String(formData.get("method") ?? "") || null;

  const { error } = await supabase.from("expenses").insert({
    purchase_order_id: purchaseOrderId,
    vendor_name: vendorName,
    amount,
    paid_at: status === "paid" ? paidAt ?? new Date().toISOString().slice(0, 10) : paidAt,
    method,
    status,
    organization_id: organizationId,
  });

  if (error) {
    redirect(`/expenses/new?error=${encodeURIComponent(error.message)}`);
  }

  if (purchaseOrderId && status === "paid") {
    await supabase.from("purchase_orders").update({ payment_status: "paid" }).eq("id", purchaseOrderId);
  }

  revalidatePath("/expenses");
  revalidatePath("/purchases");
  redirect("/expenses");
}

export async function updateExpenseStatus(id: string, status: string) {
  const supabase = await createClient();

  const { data: expense } = await supabase
    .from("expenses")
    .select("purchase_order_id")
    .eq("id", id)
    .single();

  await supabase
    .from("expenses")
    .update({
      status,
      paid_at: status === "paid" ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", id);

  if (expense?.purchase_order_id && status === "paid") {
    await supabase
      .from("purchase_orders")
      .update({ payment_status: "paid" })
      .eq("id", expense.purchase_order_id);
  }

  revalidatePath("/expenses");
  revalidatePath("/purchases");
}
