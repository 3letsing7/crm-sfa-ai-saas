import Link from "next/link";
import { signUp } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SignupOrgFields } from "@/components/auth/signup-org-fields";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={signUp} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">氏名</Label>
            <Input id="full_name" name="full_name" required placeholder="山田 太郎" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" required placeholder="you@company.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" name="password" type="password" required minLength={6} placeholder="6文字以上" />
          </div>

          <SignupOrgFields />

          {params.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {params.error}
            </p>
          )}

          <Button type="submit" className="w-full">
            新規登録
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          既にアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            ログイン
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
