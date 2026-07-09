import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/lib/supabase/types";

const STATUS_OPTIONS: { value: Customer["status"]; label: string }[] = [
  { value: "lead", label: "リード" },
  { value: "prospect", label: "見込み客" },
  { value: "active", label: "取引中" },
  { value: "churned", label: "離脱" },
];

export function CustomerForm({
  action,
  defaultValues,
  submitLabel,
  error,
}: {
  action: (formData: FormData) => void;
  defaultValues?: Partial<Customer>;
  submitLabel: string;
  error?: string;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="company_name">会社名 *</Label>
          <Input id="company_name" name="company_name" required defaultValue={defaultValues?.company_name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_name">担当者名</Label>
          <Input id="contact_name" name="contact_name" defaultValue={defaultValues?.contact_name ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="industry">業種</Label>
          <Input id="industry" name="industry" defaultValue={defaultValues?.industry ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" name="email" type="email" defaultValue={defaultValues?.email ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">電話番号</Label>
          <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="status">ステータス</Label>
          <Select id="status" name="status" defaultValue={defaultValues?.status ?? "lead"}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="memo">メモ</Label>
          <Textarea id="memo" name="memo" rows={4} defaultValue={defaultValues?.memo ?? ""} />
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
