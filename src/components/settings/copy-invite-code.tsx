"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyInviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — no-op, the code is still visible to select/copy manually
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="text-success" /> : <Copy />}
      {copied ? "コピーしました" : "コピー"}
    </Button>
  );
}
