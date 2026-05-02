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
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
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
  CpuChipIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import { useRouter } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/src/components/admin/layout/SidebarContext";
import { AdminSidebar, type AdminNavItem } from "@/src/components/admin/AdminSidebar";
import { AdminHeader } from "@/src/components/admin/layout/AdminHeader";
import type { AdminNotification } from "@/src/components/admin/layout/NotificationBell";
import { ToastProvider } from "@/src/components/ui/Toast";
import { useAuth } from "@/src/store/auth.store";
import { SessionExpiredModal } from "@/src/components/admin/layout/SessionExpiredModal";

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
    label: "Sản phẩm",
    icon: <CubeIcon className="w-5 h-5" />,
    children: [
      {
        value: "products-list",
        label: "Tất cả sản phẩm",
        href: "/products",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
      {
        value: "products-new",
        label: "Thêm sản phẩm",
        href: "/products/new",
        icon: <PlusIcon className="w-4 h-4" />,
      },
    ],
  },

  // ── Categories & Brands ──────────────────────────────────────────────────────
  {
    value: "categories",
    label: "Các danh mục",
    icon: <TagIcon className="w-5 h-5" />,
    children: [
      {
        value: "categories-list",
        label: "Danh mục",
        href: "/categories",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
      {
        value: "brands-list",
        label: "Thương hiệu",
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
        label: "Tất cả đơn hàng",
        href: "/orders",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
      {
        value: "orders-transactions",
        label: "Giao dịch TT",
        href: "/orders/transactions",
        icon: <CreditCardIcon className="w-4 h-4" />,
        requiredRoles: ["admin"],
      },
      {
        value: "orders-returns",
        label: "Trả hàng & Hoàn tiền",
        href: "/orders/returns",
        icon: <ArrowPathIcon className="w-4 h-4" />,
      },
    ],
  },

  // ── Users ────────────────────────────────────────────────────────────────────
  {
    value: "users",
    label: "Người dùng",
    icon: <UsersIcon className="w-5 h-5" />,
    children: [
      {
        value: "customers",
        label: "Khách hàng",
        href: "/customers",
        icon: <UserGroupIcon className="w-4 h-4" />,
      },
      {
        value: "employees",
        label: "Nhân viên",
        href: "/employees",
        icon: <UsersIcon className="w-4 h-4" />,
        requiredRoles: ["admin"],
      },
      {
        value: "roles",
        label: "Vai trò & Phân quyền",
        href: "/roles",
        icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
        requiredRoles: ["admin"],
      },
    ],
  },

  // ── Inventory ────────────────────────────────────────────────────────────────
  {
    value: "inventory",
    label: "Kho hàng",
    icon: <ArchiveBoxIcon className="w-5 h-5" />,
    requiredRoles: ["admin"],
    children: [
      {
        value: "inventory-overview",
        label: "Tổng quan",
        href: "/inventory",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
      {
        value: "inventory-items",
        label: "Hàng hoá trong kho",
        href: "/inventory/items",
        icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      },
      {
        value: "inventory-stock-in",
        label: "Nhập kho",
        href: "/inventory/stock-in",
        icon: <ArrowUpTrayIcon className="w-4 h-4" />,
      },
      {
        value: "inventory-exports",
        label: "Phiếu xuất kho",
        href: "/inventory/exports",
        icon: <ArrowDownTrayIcon className="w-4 h-4" />,
      },
      {
        value: "inventory-low-stock",
        label: "Cảnh báo tồn kho",
        href: "/inventory/low-stock",
        icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      },
      {
        value: "inventory-movements",
        label: "Nhật ký hoạt động",
        href: "/inventory/movements",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
      {
        value: "inventory-suppliers",
        label: "Nhà cung cấp",
        href: "/inventory/suppliers",
        icon: <BuildingStorefrontIcon className="w-4 h-4" />,
      },
    ],
  },

   // ── Promotions ───────────────────────────────────────────────────────────────
  {
    value: "promotions",
    label: "Khuyến mãi",
    icon: <TicketIcon className="w-5 h-5" />,
    dividerAfter: true,
    children: [
      {
        value: "promotions-list",
        label: "Tất cả khuyến mãi",
        href: "/promotions",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
      {
        value: "promotions-new",
        label: "Thêm khuyến mãi",
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

  // ── Phân tích & Hỗ trợ ───────────────────────────────────────────────────────
  {
    value: "analytics",
    label: "Phân tích & Hỗ trợ",
    icon: <ChartBarIcon className="w-5 h-5" />,
    dividerAfter: true,
    children: [
      {
        value: "reports",
        label: "Báo cáo",
        href: "/reports",
        icon: <ChartBarIcon className="w-4 h-4" />,
        requiredRoles: ["admin"],
      },
      {
        value: "support",
        label: "Hỗ trợ khách hàng",
        href: "/support",
        icon: <ChatBubbleLeftRightIcon className="w-4 h-4" />,
        requiredRoles: ["admin", "cskh"],
      },
      {
        value: "reviews",
        label: "Đánh giá sản phẩm",
        href: "/reviews",
        icon: <StarIcon className="w-4 h-4" />,
        requiredRoles: ["admin", "cskh"],
      },
    ],
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
        value: "content-homepage",
        label: "Trang chủ",
        href: "/content/homepage",
        icon: <HomeIcon className="w-4 h-4" />,
      },
      {
        value: "content-faq",
        label: "FAQ",
        href: "/content/faq",
        icon: <QuestionMarkCircleIcon className="w-4 h-4" />,
      },
    ],
  },

  // ── Build PC ─────────────────────────────────────────────────────────────────
  {
    value: "buildpc",
    label: "Build PC",
    icon: <CpuChipIcon className="w-5 h-5" />,
    requiredRoles: ["admin", "staff"],
    children: [
      {
        value: "buildpc-slots",
        label: "Khe linh kiện",
        href: "/content/buildpc/slots",
        icon: <WrenchScrewdriverIcon className="w-4 h-4" />,
      },
      {
        value: "buildpc-rules",
        label: "Quy tắc tương thích",
        href: "/content/buildpc/rules",
        icon: <ShieldCheckIcon className="w-4 h-4" />,
      },
      {
        value: "buildpc-builds",
        label: "Build đã lưu",
        href: "/content/buildpc/builds",
        icon: <ListBulletIcon className="w-4 h-4" />,
      },
    ],
  },

  // ── Hệ thống ─────────────────────────────────────────────────────────────────
  {
    value: "system",
    label: "Hệ thống",
    icon: <Cog6ToothIcon className="w-5 h-5" />,
    requiredRoles: ["admin"],
    children: [
      {
        value: "audit-logs",
        label: "Nhật ký hoạt động",
        href: "/audit-logs",
        icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
      },
      {
        value: "settings-general",
        label: "Cài đặt chung",
        href: "/settings/general",
        icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      },
      {
        value: "settings-payments",
        label: "Thanh toán",
        href: "/settings/payments",
        icon: <CreditCardIcon className="w-4 h-4" />,
      },
      {
        value: "settings-shipping",
        label: "Vận chuyển",
        href: "/settings/shipping",
        icon: <TruckIcon className="w-4 h-4" />,
      },
      {
        value: "settings-notifications",
        label: "Thông báo hệ thống",
        href: "/settings/notifications",
        icon: <BellIcon className="w-4 h-4" />,
      },
      {
        value: "settings-tax",
        label: "Thuế",
        href: "/settings/tax",
        icon: <ReceiptPercentIcon className="w-4 h-4" />,
      },
      {
        value: "settings-integrations",
        label: "Tích hợp",
        href: "/settings/integrations",
        icon: <PuzzlePieceIcon className="w-4 h-4" />,
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
  const { state: authState, logout } = useAuth();
  const router = useRouter();

  const currentUser = authState.user;
  const adminUser = {
    name: currentUser?.fullName ?? "Nhân viên",
    email: currentUser?.email ?? "",
    role: currentUser?.roles?.[0] ?? "staff",
    avatarUrl: currentUser?.avatar ?? undefined,
  };

  function handleSignOut() {
    logout();
    router.push("/login");
  }

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
          user={adminUser}
          notifications={MOCK_NOTIFICATIONS}
          onSignOut={handleSignOut}
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

      <SessionExpiredModal />
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
