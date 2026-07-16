"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserAndOrg } from "@/lib/supabase/org";

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const { user, organizationId } = await requireUserAndOrg(supabase);

  const { error } = await supabase.from("tasks").insert({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    priority: String(formData.get("priority") ?? "medium"),
    due_date: String(formData.get("due_date") ?? "") || null,
    assigned_to: user.id,
    created_by: user.id,
    organization_id: organizationId,
  });

  if (error) {
    redirect(`/tasks?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function toggleTaskDone(id: string, isDone: boolean) {
  const supabase = await createClient();
  await supabase
    .from("tasks")
    .update({ is_done: isDone, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/tasks");
}
