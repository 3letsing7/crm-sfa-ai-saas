"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Handshake,
  ListChecks,
  FileText,
  PackageCheck,
  Truck,
  Wallet,
  CreditCard,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/customers", label: "顧客管理", icon: Users },
  { href: "/deals", label: "商談管理", icon: Handshake },
  { href: "/tasks", label: "タスク管理", icon: ListChecks },
  { href: "/invoices", label: "請求書管理", icon: FileText },
  { href: "/orders", label: "受注管理", icon: PackageCheck },
  { href: "/purchases", label: "発注・仕入管理", icon: Truck },
  { href: "/payments", label: "入金管理", icon: Wallet },
  { href: "/expenses", label: "支払管理", icon: CreditCard },
  { href: "/checkout", label: "顧客向け決済画面", icon: ShoppingCart },
  { href: "/ai", label: "AI営業支援", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-active text-sm font-bold text-sidebar-active-foreground">
          M
        </div>
        <span className="text-sm font-semibold tracking-wide text-white">
          MeilleureVieSales
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-active text-sidebar-active-foreground"
                  : "text-sidebar-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-4 text-xs text-white/40">
        AI Sales Suite · Phase 1
      </div>
    </aside>
  );
}
