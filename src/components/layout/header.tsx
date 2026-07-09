import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="text-sm text-muted-foreground">
        {new Date().toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "short",
        })}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{user?.email}</span>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            <LogOut />
            ログアウト
          </Button>
        </form>
      </div>
    </header>
  );
}
