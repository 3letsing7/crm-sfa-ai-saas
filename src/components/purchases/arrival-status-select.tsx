"use client";

import { useTransition } from "react";
import { updateArrivalStatus } from "@/app/(app)/purchases/actions";
import { Select } from "@/components/ui/select";
import type { ArrivalStatus } from "@/lib/supabase/types";

const LABEL: Record<ArrivalStatus, string> = {
  pending: "未入荷",
  arrived: "入荷済み",
  cancelled: "キャンセル",
};

export function ArrivalStatusSelect({ id, status }: { id: string; status: ArrivalStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      className="h-7 py-0 text-xs"
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateArrivalStatus(id, e.target.value))}
    >
      {(Object.keys(LABEL) as ArrivalStatus[]).map((key) => (
        <option key={key} value={key}>
          {LABEL[key]}
        </option>
      ))}
    </Select>
  );
}
