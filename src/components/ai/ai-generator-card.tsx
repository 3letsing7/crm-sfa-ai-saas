"use client";

import { useState, useTransition } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Option = { id: string; label: string };
type AiResult = { ok: true; content: string } | { ok: false; error: string };

export function AiGeneratorCard({
  title,
  description,
  pickerLabel,
  options,
  emptyMessage,
  buttonLabel,
  action,
  savedNote,
}: {
  title: string;
  description: string;
  pickerLabel: string;
  options: Option[];
  emptyMessage: string;
  buttonLabel: string;
  action: (id: string) => Promise<AiResult>;
  savedNote?: string;
}) {
  const [selected, setSelected] = useState(options[0]?.id ?? "");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    if (!selected) return;
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await action(selected);
      if (res.ok) {
        setResult(res.content);
      } else {
        setError(res.error);
      }
    });
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — no-op
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-base font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="sm:flex-1"
              >
                <option value="" disabled>
                  {pickerLabel}
                </option>
                {options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              <Button type="button" onClick={handleGenerate} disabled={isPending || !selected}>
                {isPending ? "生成中..." : buttonLabel}
              </Button>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            {result && (
              <div className="space-y-2">
                <div className="whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-4 text-sm leading-relaxed">
                  {result}
                </div>
                <div className="flex items-center justify-between">
                  {savedNote && <p className="text-xs text-muted-foreground">{savedNote}</p>}
                  <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="ml-auto">
                    {copied ? <Check className="text-success" /> : <Copy />}
                    {copied ? "コピーしました" : "コピー"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
