"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  confirmMessage = "本当に削除しますか？この操作は取り消せません。",
}: {
  action: () => void;
  confirmMessage?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        <Trash2 />
        削除
      </Button>
    </form>
  );
}
