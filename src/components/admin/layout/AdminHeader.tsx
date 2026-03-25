"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { useSidebar } from "@/src/components/admin/layout/SidebarContext";
import { AdminBreadcrumb } from "@/src/components/admin/layout/AdminBreadcrumb";
import { AdminUserMenu, type AdminUser } from "@/src/components/admin/layout/AdminUserMenu";
import { NotificationBell, type AdminNotification } from "@/src/components/admin/layout/NotificationBell";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminHeaderProps {
  user: AdminUser;
  notifications: AdminNotification[];
  onSignOut: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

// Re-export for consumers who import from this module
export type { AdminUser, AdminNotification };

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AdminHeader — sticky top bar with hamburger (mobile), breadcrumb,
 * notification bell, and user menu. Background matches the sidebar (bg-secondary-900).
 */
export function AdminHeader({
  user,
  notifications,
  onSignOut,
  onMarkRead,
  onMarkAllRead,
}: AdminHeaderProps) {
  const { toggleMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-secondary-800 border-b border-secondary-700/60 px-4 text-white shadow-sm">
      {/* Mobile hamburger — hidden on lg+ */}
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={toggleMobile}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-secondary-300 transition-colors hover:bg-white/[0.06] hover:text-secondary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 lg:hidden"
      >
        <Bars3Icon className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Breadcrumb — auto-derives from pathname */}
      <div className="flex-1 min-w-0">
        <AdminBreadcrumb variant="inverse" />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 shrink-0">
        <NotificationBell
          notifications={notifications}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
        />
        <AdminUserMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}
