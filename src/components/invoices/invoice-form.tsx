"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type Item = { name: string; quantity: number; unit_price: number };
type Option = { id: string; label: string };

export function InvoiceForm({
  action,
  customers,
  deals,
  error,
  defaultValues,
  defaultItems,
  submitLabel = "請求書を作成",
}: {
  action: (formData: FormData) => void;
  customers: Option[];
  deals: Option[];
  error?: string;
  defaultValues?: {
    customer_id?: string;
    deal_id?: string | null;
    due_date?: string | null;
    invoice_number_t?: string | null;
    tax_rate?: number;
  };
  defaultItems?: Item[];
  submitLabel?: string;
}) {
  const [items, setItems] = useState<Item[]>(
    defaultItems && defaultItems.length > 0 ? defaultItems : [{ name: "", quantity: 1, unit_price: 0 }]
  );
  const [taxRate, setTaxRate] = useState(defaultValues?.tax_rate ?? 10);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_price || 0), 0),
    [items]
  );
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;

  function updateItem(index: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { name: "", quantity: 1, unit_price: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={action} className="max-w-3xl space-y-6">
      <input type="hidden" name="items_json" value={JSON.stringify(items)} />
      <input type="hidden" name="tax_rate" value={taxRate} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="customer_id">顧客 *</Label>
          <Select id="customer_id" name="customer_id" required defaultValue={defaultValues?.customer_id ?? ""}>
            <option value="" disabled>
              顧客を選択
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deal_id">関連する商談(任意)</Label>
          <Select id="deal_id" name="deal_id" defaultValue={defaultValues?.deal_id ?? ""}>
            <option value="">なし</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="due_date">支払期限</Label>
          <Input id="due_date" name="due_date" type="date" defaultValue={defaultValues?.due_date ?? ""} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="invoice_number_t">適格請求書発行事業者登録番号</Label>
          <Input
            id="invoice_number_t"
            name="invoice_number_t"
            placeholder="T1234567890123"
            defaultValue={defaultValues?.invoice_number_t ?? ""}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>明細</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus />
            明細行を追加
          </Button>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-3">
          <div className="grid grid-cols-12 gap-2 px-1 text-xs text-muted-foreground">
            <div className="col-span-6">品目</div>
            <div className="col-span-2">数量</div>
            <div className="col-span-3">単価</div>
            <div className="col-span-1"></div>
          </div>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 items-center gap-2">
              <Input
                className="col-span-6"
                placeholder="例：ソフトウェア導入支援費"
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
              />
              <Input
                className="col-span-2"
                type="number"
                min={0}
                step={1}
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
              />
              <Input
                className="col-span-3"
                type="number"
                min={0}
                step={1}
                value={item.unit_price}
                onChange={(e) => updateItem(index, { unit_price: Number(e.target.value) })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="col-span-1"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-2 rounded-lg border border-border p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">小計</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">消費税率</span>
            <Select
              className="h-7 w-20 py-0 text-xs"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
            >
              <option value={10}>10%</option>
              <option value={8}>8%(軽減税率)</option>
              <option value={0}>0%</option>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">消費税額</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
            <span>合計</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
