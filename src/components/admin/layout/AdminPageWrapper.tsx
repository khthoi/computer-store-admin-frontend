import type { ReactNode } from "react";
import { Skeleton } from "@/src/components/ui/Skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminPageWrapperProps {
  title: string;
  description?: string;
  action?: ReactNode;
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AdminPageWrapper — standard page shell with title, optional description,
 * optional action slot, and a content area.
 *
 * Not a client component — safe to use in Server Components.
 *
 * ```tsx
 * <AdminPageWrapper
 *   title="Products"
 *   description="Manage your product catalogue"
 *   action={<Button>Add Product</Button>}
 * >
 *   <DataTable ... />
 * </AdminPageWrapper>
 * ```
 */
export function AdminPageWrapper({
  title,
  description,
  action,
  isLoading = false,
  children,
  className = "",
}: AdminPageWrapperProps) {
  return (
    <div
      className={[
        "px-5 py-5 mx-auto w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-6">
        {/* Left: title + description */}
        <div className="min-w-0">
          {isLoading ? (
            <Skeleton className="h-8 w-48 rounded-md" />
          ) : (
            <h1 className="text-2xl font-bold text-secondary-900 truncate">
              {title}
            </h1>
          )}

          {!isLoading && description && (
            <p className="text-sm text-secondary-500 mt-0.5">{description}</p>
          )}
        </div>

        {/* Right: action slot */}
        {!isLoading && action && (
          <div className="shrink-0 mt-2 sm:mt-0 sm:ml-4">{action}</div>
        )}
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}
