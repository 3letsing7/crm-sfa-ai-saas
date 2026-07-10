"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Building,
  TrendingUp,
  ListChecks,
  Sparkles,
  FileText,
  ShoppingCart,
  Package,
  Wallet,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    section: "CRM / SFA",
    items: [
      { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { href: "/customers", label: "顧客管理", icon: Building },
      { href: "/deals", label: "商談管理", icon: TrendingUp },
      { href: "/tasks", label: "タスク管理", icon: ListChecks },
      { href: "/ai", label: "AI営業支援（AI機能）", icon: Sparkles },
    ],
  },
  {
    section: "受発注",
    items: [
      { href: "/invoices", label: "請求書管理", icon: FileText },
      { href: "/orders", label: "受注管理", icon: ShoppingCart },
      { href: "/purchases", label: "発注・仕入管理", icon: Package },
    ],
  },
  {
    section: "決済・債権債務",
    items: [
      { href: "/payments", label: "入金管理", icon: Wallet },
      { href: "/expenses", label: "支払管理", icon: CreditCard },
      { href: "/checkout", label: "決済画面（顧客向け）", icon: Smartphone },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[200px] min-w-[200px] shrink-0 flex-col overflow-y-auto border-r-[0.5px] border-border bg-sidebar py-3 md:flex">
      <div className="flex items-center gap-[7px] px-3.5 pb-3.5 text-[11px] font-medium tracking-tight text-foreground">
        <Building2 className="h-[17px] w-[17px] shrink-0 text-primary" />
        MeilleureVieSales
      </div>

      {NAV_GROUPS.map((group, gi) => (
        <div key={group.section}>
          {gi > 0 && <div className="my-2 h-px bg-border" />}
          <div className="mt-1 px-3.5 pb-1 text-[10px] uppercase tracking-wide text-sidebar-section">
            {group.section}
          </div>
          {group.items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-[9px] px-3.5 py-[7px] text-xs transition-colors",
                  active
                    ? "bg-sidebar-active font-medium text-sidebar-active-foreground [&_svg]:text-sidebar-active-foreground"
                    : "text-sidebar-foreground hover:bg-card hover:text-foreground"
                )}
              >
                <Icon className="h-[15px] w-[15px] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
