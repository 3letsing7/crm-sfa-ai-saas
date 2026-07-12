"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function generateInvoiceNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${y}${m}${d}-${rand}`;
}

export type InvoiceItemInput = {
  name: string;
  quantity: number;
  unit_price: number;
};

export async function createInvoice(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const customerId = String(formData.get("customer_id") ?? "");
  const dealId = String(formData.get("deal_id") ?? "") || null;
  const dueDate = String(formData.get("due_date") ?? "") || null;
  const invoiceNumberT = String(formData.get("invoice_number_t") ?? "") || null;
  const taxRate = Number(formData.get("tax_rate") ?? 10);

  const itemsRaw = String(formData.get("items_json") ?? "[]");
  let items: InvoiceItemInput[] = [];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    items = [];
  }
  items = items.filter((i) => i.name && i.quantity > 0);

  if (items.length === 0) {
    redirect(`/invoices/new?error=${encodeURIComponent("明細を1件以上入力してください")}`);
  }

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      customer_id: customerId,
      deal_id: dealId,
      invoice_no: generateInvoiceNo(),
      due_date: dueDate,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      status: "draft",
      invoice_number_t: invoiceNumberT,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !invoice) {
    redirect(`/invoices/new?error=${encodeURIComponent(error?.message ?? "作成に失敗しました")}`);
  }

  const { error: itemsError } = await supabase.from("invoice_items").insert(
    items.map((i) => ({
      invoice_id: invoice!.id,
      name: i.name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      amount: i.quantity * i.unit_price,
    }))
  );

  if (itemsError) {
    redirect(`/invoices/new?error=${encodeURIComponent(itemsError.message)}`);
  }

  revalidatePath("/invoices");
  redirect(`/invoices/${invoice!.id}`);
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("invoices").update({ status }).eq("id", id);
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  await supabase.from("invoices").delete().eq("id", id);
  revalidatePath("/invoices");
  redirect("/invoices");
}
