import Link from "next/link";
import { Bell, LogOut, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

function getInitials(email: string | undefined) {
  if (!email) return "?";
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b-[0.5px] border-border bg-card px-[18px]">
      <span className="text-sm font-medium text-foreground">
        {new Date().toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "short",
        })}
      </span>
      <div className="flex items-center gap-2.5">
        <Bell className="h-[17px] w-[17px] text-muted-foreground" />
        <Button asChild variant="ghost" size="icon" className="h-[26px] w-[26px]" title="設定">
          <Link href="/settings">
            <Settings className="h-[15px] w-[15px]" />
          </Link>
        </Button>
        <Link
          href="/settings"
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-primary"
        >
          {getInitials(user?.email)}
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="icon" className="h-[26px] w-[26px]" title="ログアウト">
            <LogOut className="h-[15px] w-[15px]" />
          </Button>
        </form>
      </div>
    </header>
  );
}
