"use client";

import { useTransition } from "react";
import { updateExpenseStatus } from "@/app/(app)/expenses/actions";
import { Button } from "@/components/ui/button";
import type { ExpenseStatus } from "@/lib/supabase/types";

export function ExpenseStatusToggle({ id, status }: { id: string; status: ExpenseStatus }) {
  const [isPending, startTransition] = useTransition();

  if (status === "paid") {
    return (
      <span className="text-xs text-muted-foreground">支払済み</span>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(() => updateExpenseStatus(id, "paid"))}
    >
      支払済みにする
    </Button>
  );
}
