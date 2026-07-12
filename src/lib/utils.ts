import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  bank_transfer: "銀行振込",
  credit_card: "クレジットカード",
  cash: "現金",
  other: "その他",
};

export function formatPaymentMethod(method: string | null | undefined) {
  if (!method) return "-";
  return PAYMENT_METHOD_LABEL[method] ?? method;
}
