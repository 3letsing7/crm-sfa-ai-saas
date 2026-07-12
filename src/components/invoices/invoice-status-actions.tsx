"use client";

import { useTransition } from "react";
import { updateInvoiceStatus } from "@/app/(app)/invoices/actions";
import { Button } from "@/components/ui/button";
import type { InvoiceStatus } from "@/lib/supabase/types";

const TRANSITIONS: Record<InvoiceStatus, { to: InvoiceStatus; label: string }[]> = {
  draft: [{ to: "sent", label: "送付済みにする" }],
  sent: [
    { to: "paid", label: "入金済みにする" },
    { to: "overdue", label: "期限超過にする" },
  ],
  overdue: [{ to: "paid", label: "入金済みにする" }],
  paid: [],
  void: [],
};

export function InvoiceStatusActions({ id, status }: { id: string; status: InvoiceStatus }) {
  const [isPending, startTransition] = useTransition();
  const options = TRANSITIONS[status] ?? [];

  if (options.length === 0) return null;

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <Button
          key={opt.to}
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => startTransition(() => updateInvoiceStatus(id, opt.to))}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
