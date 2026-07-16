"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupOrgFields() {
  const [mode, setMode] = useState<"create" | "join">("create");

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <input type="hidden" name="org_mode" value={mode} />

      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={
            mode === "create"
              ? "flex-1 rounded-md bg-primary px-3 py-1.5 text-primary-foreground"
              : "flex-1 rounded-md border border-input px-3 py-1.5 text-muted-foreground"
          }
        >
          新しい会社を登録
        </button>
        <button
          type="button"
          onClick={() => setMode("join")}
          className={
            mode === "join"
              ? "flex-1 rounded-md bg-primary px-3 py-1.5 text-primary-foreground"
              : "flex-1 rounded-md border border-input px-3 py-1.5 text-muted-foreground"
          }
        >
          招待コードで参加
        </button>
      </div>

      {mode === "create" ? (
        <div className="space-y-1.5">
          <Label htmlFor="company_name">会社名 *</Label>
          <Input id="company_name" name="company_name" required placeholder="株式会社サンプル" />
          <p className="text-xs text-muted-foreground">
            登録後、招待コードが発行されます。同じ会社の他のメンバーはそのコードで参加できます。
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="invite_code">招待コード *</Label>
          <Input id="invite_code" name="invite_code" required placeholder="例：a1b2c3d4" />
          <p className="text-xs text-muted-foreground">会社の管理者から共有された招待コードを入力してください。</p>
        </div>
      )}
    </div>
  );
}
