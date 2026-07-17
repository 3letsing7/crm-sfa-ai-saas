"use client";

import { useTransition } from "react";
import { updateOrderProgress } from "@/app/(app)/orders/actions";
import { Select } from "@/components/ui/select";
import type { OrderProgress } from "@/lib/supabase/types";

const LABEL: Record<OrderProgress, string> = {
  pending: "未着手",
  in_progress: "進行中",
  completed: "完了",
  cancelled: "キャンセル",
};

export function OrderProgressSelect({ id, progress }: { id: string; progress: OrderProgress }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      className="h-7 py-0 text-xs"
      defaultValue={progress}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateOrderProgress(id, e.target.value))}
    >
      {(Object.keys(LABEL) as OrderProgress[]).map((key) => (
        <option key={key} value={key}>
          {LABEL[key]}
        </option>
      ))}
    </Select>
  );
}
