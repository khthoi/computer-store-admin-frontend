"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  Fragment,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { useSidebar } from "@/src/components/admin/layout/SidebarContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminNavItem {
  value: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
  dividerAfter?: boolean;
  children?: AdminNavItem[];
  /**
   * If provided, the item is only visible to users whose role is in this array.
   * Omitting the prop (or passing an empty array) shows the item to all roles.
   */
  requiredRoles?: string[];
}

export interface AdminSidebarProps {
  items: AdminNavItem[];
  /** Current authenticated user's role (used for visibility checks) */
  userRole?: string;
  /** Logo/branding area */
  header?: ReactNode;
  /** User info / sign-out area */
  footer?: ReactNode;
  className?: string;
}

// ─── Internal context ─────────────────────────────────────────────────────────

interface SidebarInternalCtx {
  collapsed: boolean;
  userRole: string;
}

const InternalCtx = createContext<SidebarInternalCtx>({
  collapsed: false,
  userRole: "",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAllowed(item: AdminNavItem, userRole: string): boolean {
  if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
  return item.requiredRoles.includes(userRole);
}

/**
 * Returns true when `href` matches the current pathname.
 * "/" is treated as an exact match only to avoid false-positives on all routes.
 */
function isItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Recursively checks whether any descendant of `item` is active.
 */
function hasActiveDescendant(pathname: string, item: AdminNavItem): boolean {
  return (item.children ?? []).some(
    (child) =>
      (child.href ? isItemActive(pathname, child.href) : false) ||
      hasActiveDescendant(pathname, child)
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({ item, depth = 0 }: { item: AdminNavItem; depth?: number }) {
  const { collapsed, userRole } = useContext(InternalCtx);
  const pathname = usePathname();

  const hasChildren = !!item.children?.length;
  const active = item.href ? isItemActive(pathname, item.href) : false;
  const childActive = hasActiveDescendant(pathname, item);

  // Auto-open when a child route is active; allow manual toggle otherwise.
  const [open, setOpen] = useState(() => childActive);
  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  const visibleChildren = item.children?.filter((c) => isAllowed(c, userRole));

  // Indentation by depth level
  const pl = depth === 0 ? "pl-3" : depth === 1 ? "pl-8" : "pl-12";

  const baseClass = [
    "group relative flex w-full items-center gap-3 rounded-lg py-2 pr-3 text-sm font-medium",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
    pl,
    active
      ? "bg-violet-500/20 text-white border-violet-400"
      : childActive
        ? "bg-white/[0.05] text-secondary-100 border-violet-500/30"
        : "text-secondary-400 hover:bg-white/[0.06] hover:text-secondary-100 border-transparent",
    item.disabled ? "pointer-events-none opacity-40" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const iconClass = [
    "shrink-0 w-5 h-5 transition-colors",
    active
      ? "text-violet-300"
      : childActive
        ? "text-secondary-300"
        : "text-secondary-500 group-hover:text-secondary-300",
  ].join(" ");

  const content = (
    <>
      {item.icon && (
        <span className={iconClass} aria-hidden="true">
          {item.icon}
        </span>
      )}

      {/* Hide label text when sidebar is collapsed at root depth */}
      {!(collapsed && depth === 0) && (
        <>
          <span className="flex-1 truncate">{item.label}</span>

          {item.badge && (
            <span className="shrink-0 rounded-full bg-violet-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {item.badge}
            </span>
          )}

          {hasChildren && (
            <ChevronRightIcon
              className={[
                "w-4 h-4 shrink-0 text-secondary-500 transition-transform duration-150",
                open ? "rotate-90" : "",
              ].join(" ")}
              aria-hidden="true"
            />
          )}
        </>
      )}
    </>
  );

  // Leaf items (href only, no children) → <Link>
  // Parent items (has children) → <button> that toggles sub-list
  const trigger =
    item.href && !hasChildren ? (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={baseClass}
        title={collapsed && depth === 0 ? item.label : undefined}
      >
        {content}
      </Link>
    ) : (
      <button
        type="button"
        disabled={item.disabled}
        aria-expanded={hasChildren ? open : undefined}
        onClick={hasChildren ? () => setOpen((v) => !v) : undefined}
        className={baseClass}
        title={collapsed && depth === 0 ? item.label : undefined}
      >
        {content}
      </button>
    );

  const showChildren =
    hasChildren && !collapsed && open && !!visibleChildren?.length;

  return (
    <li>
      {trigger}
      {showChildren && (
        <ul role="list" className="mt-0.5 flex flex-col gap-0.5">
          {visibleChildren!.map((child) => (
            <NavItem key={child.value} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── AdminSidebar ─────────────────────────────────────────────────────────────

/**
 * AdminSidebar — collapsible admin navigation with role-based item visibility
 * and hierarchical sub-menu support.
 *
 * - Collapse state is managed via SidebarContext.
 * - Active state is derived dynamically from `usePathname()`.
 * - Parent items auto-expand when a child route is active.
 * - On mobile (< lg), the parent renders this inside a slide-over overlay.
 */
export function AdminSidebar({
  items,
  userRole = "",
  header,
  footer,
  className = "",
}: AdminSidebarProps) {
  const { collapsed, toggle } = useSidebar();

  const visibleItems = items.filter((item) => isAllowed(item, userRole));

  return (
    <InternalCtx.Provider value={{ collapsed, userRole }}>
      <aside
        className={[
          "flex flex-col bg-secondary-900 text-white transition-all duration-200 h-full",
          collapsed ? "w-16" : "w-64",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* ── Header / logo ─────────────────────────────────────────────── */}
        <div
          className={[
            "flex shrink-0 items-center border-b border-secondary-700/60 px-3 py-4",
            collapsed ? "justify-center" : "justify-between",
          ].join(" ")}
        >
          {!collapsed && header && (
            <div className="min-w-0 flex-1">{header}</div>
          )}
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggle}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-secondary-500 transition-colors hover:bg-white/[0.06] hover:text-secondary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            {collapsed ? (
              <Bars3Icon className="w-5 h-5" aria-hidden="true" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* ── Navigation ────────────────────────────────────────────────── */}
        <nav
          aria-label="Admin navigation"
          className="flex-1 overflow-y-auto px-2 py-3"
        >
          <ul role="list" className="flex flex-col gap-0.5">
            {visibleItems.map((item) => (
              <Fragment key={item.value}>
                <NavItem item={item} depth={0} />
                {item.dividerAfter && (
                  <li role="separator">
                    <hr className="my-2 border-secondary-700/60" />
                  </li>
                )}
              </Fragment>
            ))}
          </ul>
        </nav>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        {footer && !collapsed && (
          <div className="shrink-0 border-t border-secondary-700/60 p-3">
            {footer}
          </div>
        )}
      </aside>
    </InternalCtx.Provider>
  );
}
