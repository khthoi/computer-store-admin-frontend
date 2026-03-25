"use client";

import type { ReactNode } from "react";
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArchiveBoxIcon,
  TicketIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

import { SidebarProvider, useSidebar } from "@/src/components/admin/layout/SidebarContext";
import { AdminSidebar, type AdminNavItem } from "@/src/components/admin/AdminSidebar";
import { AdminHeader } from "@/src/components/admin/layout/AdminHeader";
import type { AdminUser } from "@/src/components/admin/layout/AdminUserMenu";
import type { AdminNotification } from "@/src/components/admin/layout/NotificationBell";
import { ToastProvider } from "@/src/components/ui/Toast";

// ─── Mock data (replace with real auth + SSE) ─────────────────────────────────

const MOCK_USER: AdminUser = {
  name: "Admin User",
  email: "admin@techstore.vn",
  role: "admin",
};

const MOCK_NOTIFICATIONS: AdminNotification[] = [];

// ─── Navigation items ─────────────────────────────────────────────────────────

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    value: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: <HomeIcon className="w-5 h-5" />,
    dividerAfter: true,
  },
  {
    value: "products",
    label: "Products",
    href: "/admin/products",
    icon: <CubeIcon className="w-5 h-5" />,
  },
  {
    value: "categories",
    label: "Categories & Brands",
    href: "/admin/categories",
    icon: <TagIcon className="w-5 h-5" />,
  },
  {
    value: "orders",
    label: "Orders",
    href: "/admin/orders",
    icon: <ShoppingBagIcon className="w-5 h-5" />,
  },
  {
    value: "users",
    label: "Users",
    href: "/admin/users",
    icon: <UsersIcon className="w-5 h-5" />,
  },
  {
    value: "inventory",
    label: "Inventory",
    href: "/admin/inventory",
    icon: <ArchiveBoxIcon className="w-5 h-5" />,
    requiredRoles: ["admin", "warehouse"],
  },
  {
    value: "promotions",
    label: "Promotions",
    href: "/admin/promotions",
    icon: <TicketIcon className="w-5 h-5" />,
    dividerAfter: true,
  },
  {
    value: "reports",
    label: "Reports",
    href: "/admin/reports",
    icon: <ChartBarIcon className="w-5 h-5" />,
    requiredRoles: ["admin"],
  },
  {
    value: "support",
    label: "Support",
    href: "/admin/support",
    icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
    requiredRoles: ["admin", "cskh"],
  },
  {
    value: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: <Cog6ToothIcon className="w-5 h-5" />,
  },
];

// ─── AdminLogo ────────────────────────────────────────────────────────────────

function AdminLogo() {
  return (
    <span className="text-white font-bold text-lg tracking-tight">
      TechStore <span className="text-violet-300">Admin</span>
    </span>
  );
}

// ─── AdminLayoutInner ─────────────────────────────────────────────────────────

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-secondary-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <AdminSidebar
          items={ADMIN_NAV_ITEMS}
          userRole="admin"
          header={<AdminLogo />}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <AdminSidebar
              items={ADMIN_NAV_ITEMS}
              userRole="admin"
              header={<AdminLogo />}
            />
          </div>
        </>
      )}

      {/* Right column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AdminHeader
          user={MOCK_USER}
          notifications={MOCK_NOTIFICATIONS}
          onSignOut={() => {}}
          onMarkRead={() => {}}
          onMarkAllRead={() => {}}
        />
        <main
          id="admin-main"
          className="flex-1 overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────

/**
 * AdminLayout — root layout wrapper for the admin dashboard.
 * Wraps children in SidebarProvider for cross-component sidebar state.
 *
 * Used by `src/app/(dashboard)/layout.tsx`.
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <SidebarProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </SidebarProvider>
    </ToastProvider>
  );
}
