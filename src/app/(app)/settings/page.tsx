import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyInviteCode } from "@/components/settings/copy-invite-code";
import { formatDate } from "@/lib/utils";
import type { UserRole } from "@/lib/supabase/types";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "管理者",
  manager: "マネージャー",
  member: "メンバー",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user!.id)
    .single();

  const [{ data: organization }, { data: members }] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", profile!.organization_id).single(),
    supabase
      .from("users")
      .select("*")
      .eq("organization_id", profile!.organization_id)
      .order("created_at", { ascending: true }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">設定</h1>
        <p className="text-sm text-muted-foreground">組織情報・メンバー管理</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">組織情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">会社名</p>
            <p className="text-sm font-medium">{organization?.name}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              招待コード(同じ会社のメンバーがサインアップ時に入力するとこの組織に参加できます)
            </p>
            <div className="flex items-center gap-2">
              <code className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
                {organization?.invite_code}
              </code>
              <CopyInviteCode code={organization?.invite_code ?? ""} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">メンバー({members?.length ?? 0}名)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members?.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              <div>
                <p className="font-medium">{m.full_name ?? m.email}</p>
                <p className="text-xs text-muted-foreground">
                  {m.email} ・ 参加日 {formatDate(m.created_at)}
                </p>
              </div>
              <Badge variant={m.role === "admin" ? "primary" : "outline"}>{ROLE_LABEL[m.role as UserRole]}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
