// Hand-written types mirroring supabase/migrations/0001_init.sql.
// Once the project is linked to a real Supabase project, regenerate with:
//   npx supabase gen types typescript --linked > src/lib/supabase/types.ts

export type DealStatus = "lead" | "approach" | "proposal" | "negotiation" | "won" | "lost";
export type ActivityType = "call" | "email" | "meeting" | "note" | "demo";
export type TaskPriority = "low" | "medium" | "high";
export type CustomerStatus = "lead" | "prospect" | "active" | "churned";
export type UserRole = "admin" | "manager" | "member";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";
export type PaymentMatchStatus = "unmatched" | "matched" | "partial";
export type ArrivalStatus = "pending" | "arrived" | "cancelled";
export type ExpenseStatus = "unpaid" | "paid";
export type OrderProgress = "pending" | "in_progress" | "completed" | "cancelled";

export interface AppUser {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Customer {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  status: CustomerStatus;
  memo: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  customer_id: string;
  assigned_to: string | null;
  title: string;
  status: DealStatus;
  amount: number;
  close_date: string | null;
  next_action: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  deal_id: string | null;
  customer_id: string | null;
  created_by: string | null;
  type: ActivityType;
  content: string | null;
  activity_date: string;
  created_at: string;
}

export interface Task {
  id: string;
  deal_id: string | null;
  customer_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  is_done: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  deal_id: string | null;
  invoice_no: string;
  issued_date: string;
  due_date: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: InvoiceStatus;
  invoice_number_t: string | null;
  created_by: string | null;
  created_at: string;
}

// Minimal placeholder — swap for the generated Database type when Supabase is linked.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
