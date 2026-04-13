"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/reports",             label: "Tổng quan"       },
  { href: "/reports/revenue",     label: "Doanh thu"       },
  { href: "/reports/products",    label: "Sản phẩm"        },
  { href: "/reports/customers",   label: "Khách hàng"      },
  { href: "/reports/inventory",   label: "Kho hàng"        },
  { href: "/reports/promotions",  label: "Khuyến mãi"      },
  { href: "/reports/support",     label: "Hỗ trợ & Đánh giá" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-nav */}
      <nav
        className="border-b border-secondary-200 bg-white px-6 sticky top-0 z-10 flex gap-0 overflow-x-auto"
        aria-label="Báo cáo"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/reports"
              ? pathname === "/reports"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "py-3 px-4 text-sm whitespace-nowrap border-b-2 transition-colors",
                isActive
                  ? "border-violet-600 text-violet-700 font-semibold"
                  : "border-transparent text-secondary-500 hover:text-secondary-800",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Page content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
