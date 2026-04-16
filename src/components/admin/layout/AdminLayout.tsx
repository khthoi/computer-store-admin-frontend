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
  StarIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  // Sub-item icons
  PlusIcon,
  ListBulletIcon,
  ArrowPathIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  ArrowUpTrayIcon,
  AdjustmentsHorizontalIcon,
  GlobeAltIcon,
  CreditCardIcon,
  TruckIcon,
  BellIcon,
  ReceiptPercentIcon,
  PuzzlePieceIcon,
  BoltIcon,
  // Content icons
  PhotoIcon,
  RectangleStackIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  Bars3Icon,
  QuestionMarkCircleIcon,
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
//
// Structure rules:
//   - Top-level items with children render as collapsible groups (no href needed,
//     or add href for a "section overview" link — but NOT both).
//   - Leaf items (no children) must have href.
//   - requiredRoles restricts visibility to listed roles; omit to show to all.
//   - dividerAfter draws a separator below the item/group.
//   - Active state is derived automatically from usePathname() — never hardcode.

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  // ── Dashboard ───────────────────────────────────────────────────────────────
  {
    value: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: <HomeIcon className="w-5 h-5" />,
    dividerAfter: true,
  },

  // ── Products ─────────────────────────────────────────────────────────────────
  {
    value: "products",
    label: "Products",
    icon: <CubeIcon className="w-5 h-5" />,
    children: [
      {
        value: "products-list",
        label: "All Products",
        href: "/products",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
      {
        value: "products-new",
        label: "Add Product",
        href: "/products/new",
        icon: <PlusIcon className="w-4 h-4" />,
      },
    ],
  },

  // ── Categories & Brands ──────────────────────────────────────────────────────
  {
    value: "categories",
    label: "Categories & Brands",
    icon: <TagIcon className="w-5 h-5" />,
    children: [
      {
        value: "categories-list",
        label: "Categories",
        href: "/categories",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
      {
        value: "brands-list",
        label: "Brands",
        href: "/brands",
        icon: <BuildingStorefrontIcon className="w-4 h-4" />,
      },
    ],
  },

  // ── Orders ───────────────────────────────────────────────────────────────────
  {
    value: "orders",
    label: "Orders",
    icon: <ShoppingBagIcon className="w-5 h-5" />,
    children: [
      {
        value: "orders-list",
        label: "All Orders",
        href: "/orders",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
      {
        value: "orders-returns",
        label: "Returns",
        href: "/orders/returns",
        icon: <ArrowPathIcon className="w-4 h-4" />,
      },
    ],
  },

  // ── Users ────────────────────────────────────────────────────────────────────
  {
    value: "users",
    label: "Users",
    icon: <UsersIcon className="w-5 h-5" />,
    children: [
      {
        value: "customers",
        label: "Customers",
        href: "/customers",
        icon: <UserGroupIcon className="w-4 h-4" />,
      },
      {
        value: "employees",
        label: "Employees",
        href: "/employees",
        icon: <UsersIcon className="w-4 h-4" />,
        requiredRoles: ["admin"],
      },
      {
        value: "roles",
        label: "Roles & Permissions",
        href: "/roles",
        icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
        requiredRoles: ["admin"],
      },
    ],
  },

  // ── Inventory ────────────────────────────────────────────────────────────────
  {
    value: "inventory",
    label: "Inventory",
    icon: <ArchiveBoxIcon className="w-5 h-5" />,
    requiredRoles: ["admin", "warehouse"],
    children: [
      {
        value: "inventory-overview",
        label: "Overview",
        href: "/inventory",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
      {
        value: "inventory-items",
        label: "Stock Items",
        href: "/inventory/items",
        icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      },
      {
        value: "inventory-stock-in",
        label: "Stock In",
        href: "/inventory/stock-in",
        icon: <ArrowUpTrayIcon className="w-4 h-4" />,
      },
      {
        value: "inventory-stock-out",
        label: "Stock Out",
        href: "/inventory/stock-out",
        icon: <ArrowPathIcon className="w-4 h-4" />,
      },
      {
        value: "inventory-low-stock",
        label: "Low Stock Alerts",
        href: "/inventory/low-stock",
        icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      },
      {
        value: "inventory-movements",
        label: "Movements Log",
        href: "/inventory/movements",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
      {
        value: "inventory-suppliers",
        label: "Suppliers",
        href: "/inventory/suppliers",
        icon: <BuildingStorefrontIcon className="w-4 h-4" />,
      },
    ],
  },

   // ── Promotions ───────────────────────────────────────────────────────────────
  {
    value: "promotions",
    label: "Promos & Coupons",
    icon: <TicketIcon className="w-5 h-5" />,
    dividerAfter: true,
    children: [
      {
        value: "promotions-list",
        label: "All Promos & Coupons",
        href: "/promotions",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
      {
        value: "promotions-new",
        label: "New Promotion",
        href: "/promotions/new",
        icon: <PlusIcon className="w-4 h-4" />,
      },
      {
        value: "flash-sales",
        label: "Flash Sales",
        href: "/promotions/flash-sales",
        icon: <BoltIcon className="w-4 h-4" />,
      },
    ],
  },

  // ── Reports ──────────────────────────────────────────────────────────────────
  {
    value: "reports",
    label: "Reports",
    href: "/reports",
    icon: <ChartBarIcon className="w-5 h-5" />,
    requiredRoles: ["admin"],
  },

  // ── Support ──────────────────────────────────────────────────────────────────
  {
    value: "support",
    label: "Support",
    href: "/support",
    icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
    requiredRoles: ["admin", "cskh"],
  },

  // ── Reviews ───────────────────────────────────────────────────────────────────
  {
    value: "reviews",
    label: "Đánh giá",
    href:  "/reviews",
    icon:  <StarIcon className="w-5 h-5" />,
    requiredRoles: ["admin", "cskh"],
  },

  // ── Nội dung ─────────────────────────────────────────────────────────────────
  {
    value: "content",
    label: "Nội dung",
    icon: <DocumentTextIcon className="w-5 h-5" />,
    requiredRoles: ["admin", "staff"],
    children: [
      {
        value: "content-media",
        label: "Thư viện Media",
        href: "/content/media",
        icon: <PhotoIcon className="w-4 h-4" />,
      },
      {
        value: "content-banners",
        label: "Banner",
        href: "/content/banners",
        icon: <RectangleStackIcon className="w-4 h-4" />,
      },
      {
        value: "content-pages",
        label: "Trang tĩnh",
        href: "/content/pages",
        icon: <DocumentTextIcon className="w-4 h-4" />,
      },
      {
        value: "content-announcements",
        label: "Thông báo & Popup",
        href: "/content/announcements",
        icon: <MegaphoneIcon className="w-4 h-4" />,
      },
      {
        value: "content-navigation",
        label: "Điều hướng Menu",
        href: "/content/navigation",
        icon: <Bars3Icon className="w-4 h-4" />,
      },
      {
        value: "content-faq",
        label: "FAQ",
        href: "/content/faq",
        icon: <QuestionMarkCircleIcon className="w-4 h-4" />,
      },
    ],
  },

  // ── Hệ thống ─────────────────────────────────────────────────────────────────
  {
    value: "system",
    label: "Hệ thống",
    icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
    requiredRoles: ["admin"],
    dividerAfter: true,
    children: [
      {
        value: "audit-logs",
        label: "Nhật ký hoạt động",
        href: "/audit-logs",
        icon: <ListBulletIcon className="w-4 h-4" />,
        requiredRoles: ["admin"],
      },
    ],
  },

  // ── Settings ─────────────────────────────────────────────────────────────────
  {
    value: "settings",
    label: "Settings",
    icon: <Cog6ToothIcon className="w-5 h-5" />,
    requiredRoles: ["admin"],
    children: [
      {
        value: "settings-general",
        label: "General",
        href: "/settings/general",
        icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      },
      {
        value: "settings-payments",
        label: "Payments",
        href: "/settings/payments",
        icon: <CreditCardIcon className="w-4 h-4" />,
      },
      {
        value: "settings-shipping",
        label: "Shipping",
        href: "/settings/shipping",
        icon: <TruckIcon className="w-4 h-4" />,
      },
      {
        value: "settings-notifications",
        label: "Notifications",
        href: "/settings/notifications",
        icon: <BellIcon className="w-4 h-4" />,
      },
      {
        value: "settings-tax",
        label: "Tax",
        href: "/settings/tax",
        icon: <ReceiptPercentIcon className="w-4 h-4" />,
      },
      {
        value: "settings-integrations",
        label: "Integrations",
        href: "/settings/integrations",
        icon: <PuzzlePieceIcon className="w-4 h-4" />,
      },
      {
        value: "settings-staff",
        label: "Staff & Roles",
        href: "/roles",
        icon: <GlobeAltIcon className="w-4 h-4" />,
      },
    ],
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
 *
 * Provides:
 *   - ToastProvider  — useToast() available to all admin components
 *   - SidebarProvider — collapse state + localStorage persistence
 *   - AdminSidebar   — left navigation
 *   - AdminHeader    — sticky top bar
 *   - <main>         — scrollable content area
 *
 * Mounted in `src/app/layout.tsx` so the shell is shared by every admin route.
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
