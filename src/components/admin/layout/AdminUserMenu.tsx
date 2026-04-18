"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  UserCircleIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge, type BadgeVariant } from "@/src/components/ui/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface AdminUserMenuProps {
  user: AdminUser;
  onSignOut: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleBadgeVariant(role: string): BadgeVariant {
  switch (role.toLowerCase()) {
    case "admin":
      return "primary"; // We use primary (blue) from the shared badge; violet only for sidebar/header chrome
    case "manager":
      return "info";
    case "staff":
      return "default";
    case "support":
      return "warning";
    default:
      return "default";
  }
}

function roleLabel(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AdminUserMenu — avatar button that opens a dropdown with user info,
 * profile link, and sign-out action.
 */
export function AdminUserMenu({ user, onSignOut }: AdminUserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, close]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Open user menu"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-violet-600/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <Avatar
          src={user.avatarUrl}
          name={user.name}
          size="sm"
        />
        <span className="hidden sm:block text-sm font-medium text-white truncate max-w-[120px]">
          {user.name}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-secondary-200 bg-white shadow-xl z-50"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-secondary-100">
            <p className="text-sm font-semibold text-secondary-900 truncate">{user.name}</p>
            <p className="text-xs text-secondary-500 truncate mt-0.5">{user.email}</p>
            <div className="mt-2">
              <Badge variant={roleBadgeVariant(user.role)} size="sm">
                {roleLabel(user.role)}
              </Badge>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <a
              href="/profile"
              role="menuitem"
              onClick={close}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
            >
              <UserCircleIcon className="w-4 h-4 shrink-0 text-secondary-400" aria-hidden="true" />
              Hồ sơ cá nhân
            </a>
          </div>

          <div className="border-t border-secondary-100 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => { close(); onSignOut(); }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
            >
              <ArrowLeftStartOnRectangleIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
