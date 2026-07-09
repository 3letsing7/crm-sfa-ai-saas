import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  title,
  description,
  table,
  nextSteps,
}: {
  title: string;
  description: string;
  table: string;
  nextSteps: string[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">
            この画面はまだ実装されていません。テーブル{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{table}</code>{" "}
            はすでに <code className="rounded bg-muted px-1.5 py-0.5 text-xs">supabase/migrations/0001_init.sql</code> に定義済みなので、
            顧客管理・商談管理・タスク管理と同じパターン（<code className="rounded bg-muted px-1.5 py-0.5 text-xs">actions.ts</code> のServer Action + 一覧ページ + 新規作成ページ）で実装できます。
          </p>
          <div>
            <p className="mb-2 text-sm font-medium">次の実装ステップ:</p>
            <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
              {nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            ダッシュボードに戻る
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
