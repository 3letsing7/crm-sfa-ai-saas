"use client";

import { useTransition } from "react";
import { toggleTaskDone } from "@/app/(app)/tasks/actions";
import { cn } from "@/lib/utils";

export function TaskCheckbox({ id, isDone }: { id: string; isDone: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      defaultChecked={isDone}
      disabled={isPending}
      onChange={(e) => startTransition(() => toggleTaskDone(id, e.target.checked))}
      className={cn(
        "h-4 w-4 shrink-0 cursor-pointer rounded border-input accent-[var(--primary)]",
        isPending && "opacity-50"
      )}
    />
  );
}
