"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("customers").insert({
    company_name: String(formData.get("company_name") ?? ""),
    contact_name: String(formData.get("contact_name") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    industry: String(formData.get("industry") ?? "") || null,
    status: String(formData.get("status") ?? "lead"),
    memo: String(formData.get("memo") ?? "") || null,
    created_by: user.id,
  });

  if (error) {
    redirect(`/customers/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("customers")
    .update({
      company_name: String(formData.get("company_name") ?? ""),
      contact_name: String(formData.get("contact_name") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      industry: String(formData.get("industry") ?? "") || null,
      status: String(formData.get("status") ?? "lead"),
      memo: String(formData.get("memo") ?? "") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/customers/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect("/customers");
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  await supabase.from("customers").delete().eq("id", id);
  revalidatePath("/customers");
  redirect("/customers");
}
