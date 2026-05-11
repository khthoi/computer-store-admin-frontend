"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BellIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminNotification {
  id: string;
  type: "order" | "stock" | "ticket" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  href?: string;
}

export interface NotificationBellProps {
  notifications: AdminNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function NotificationIcon({ type }: { type: AdminNotification["type"] }) {
  const cls = "w-5 h-5 shrink-0";
  switch (type) {
    case "order":
      return <ShoppingCartIcon className={`${cls} text-primary-500`} aria-hidden="true" />;
    case "stock":
      return <ExclamationTriangleIcon className={`${cls} text-warning-500`} aria-hidden="true" />;
    case "ticket":
      return <ChatBubbleLeftIcon className={`${cls} text-info-500`} aria-hidden="true" />;
    case "system":
      return <InformationCircleIcon className={`${cls} text-secondary-400`} aria-hidden="true" />;
    default:
      return <InformationCircleIcon className={`${cls} text-secondary-400`} aria-hidden="true" />;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * NotificationBell — bell icon button with unread count badge that opens
 * a notification panel on click.
 */
export function NotificationBell({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read);
  const unreadCount = unread.length;

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

  function handleItemClick(notification: AdminNotification) {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    if (notification.href) {
      close();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications — ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-blue-600/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <BellIcon className="w-5 h-5" aria-hidden="true" />

        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-error-500 px-0.5 text-[9px] font-bold text-white leading-none"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-secondary-200 bg-white shadow-xl z-50 flex flex-col"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-100 sticky top-0 bg-white z-10">
            <h2 className="text-sm font-semibold text-secondary-900">
              Thông báo
            </h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-xs text-primary-600 hover:text-primary-700 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          {notifications.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-12 text-sm text-secondary-400">
              Không có thông báo
            </div>
          ) : (
            <ul role="list" className="divide-y divide-secondary-50">
              {notifications.map((notification) => {
                const Wrapper = notification.href ? "a" : "button";
                const wrapperProps = notification.href
                  ? { href: notification.href }
                  : { type: "button" as const };

                return (
                  <li key={notification.id}>
                    <Wrapper
                      {...wrapperProps}
                      onClick={() => handleItemClick(notification)}
                      className={[
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary-50",
                        !notification.read ? "bg-blue-50" : "bg-white",
                      ].join(" ")}
                    >
                      <span className="mt-0.5">
                        <NotificationIcon type={notification.type} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-secondary-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-secondary-400 mt-1">
                          {notification.timestamp}
                        </p>
                      </div>
                      {!notification.read && (
                        <span
                          aria-label="Unread"
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500"
                        />
                      )}
                    </Wrapper>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
