import Link from "next/link";
import { signIn } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={signIn} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" required placeholder="you@company.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" />
          </div>

          {params.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {params.error}
            </p>
          )}
          {params.message === "confirmation-sent" && (
            <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
              確認メールを送信しました。メール内のリンクから認証を完了してください。
            </p>
          )}

          <Button type="submit" className="w-full">
            ログイン
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            新規登録
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
