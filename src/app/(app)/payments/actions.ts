"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createPayment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const invoiceId = String(formData.get("invoice_id") ?? "");
  const paidAmount = Number(formData.get("paid_amount") ?? 0);
  const paidAt = String(formData.get("paid_at") ?? "") || new Date().toISOString().slice(0, 10);
  const method = String(formData.get("method") ?? "") || null;

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, customer_id, total")
    .eq("id", invoiceId)
    .single();

  if (!invoice) {
    redirect(`/payments/new?error=${encodeURIComponent("請求書が見つかりません")}`);
  }

  const { data: existingPayments } = await supabase
    .from("payments")
    .select("paid_amount")
    .eq("invoice_id", invoiceId);

  const alreadyPaid = (existingPayments ?? []).reduce((sum, p) => sum + (p.paid_amount ?? 0), 0);
  const matchStatus =
    alreadyPaid + paidAmount >= (invoice!.total ?? 0) ? "matched" : "partial";

  const { error } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    customer_id: invoice!.customer_id,
    paid_amount: paidAmount,
    paid_at: paidAt,
    method,
    match_status: matchStatus,
    created_by: user.id,
  });

  if (error) {
    redirect(`/payments/new?error=${encodeURIComponent(error.message)}`);
  }

  if (matchStatus === "matched") {
    await supabase.from("invoices").update({ status: "paid" }).eq("id", invoiceId);
  }

  revalidatePath("/payments");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  redirect("/payments");
}
