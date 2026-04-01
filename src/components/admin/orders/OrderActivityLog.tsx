import type { OrderActivityEntry } from "@/src/types/order.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    year:   "numeric",
    month:  "2-digit",
    day:    "2-digit",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

interface OrderActivityLogProps {
  entries: OrderActivityEntry[];
}

export function OrderActivityLog({ entries }: OrderActivityLogProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
      <div className="px-5 py-3 border-b border-secondary-100">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
          Activity Log
        </h3>
      </div>

      {sorted.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-secondary-400">
          No activity yet.
        </div>
      ) : (
        <ol className="px-5 py-4 space-y-0">
          {sorted.map((entry, idx) => (
            <li key={entry.id} className="relative flex gap-4">
              {/* Vertical line */}
              {idx < sorted.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-4 top-8 bottom-0 w-px bg-secondary-100"
                />
              )}

              {/* Avatar */}
              <div
                aria-hidden="true"
                className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700"
              >
                {entry.actorAvatarUrl ? (
                  <img
                    src={entry.actorAvatarUrl}
                    alt={entry.actorName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  getInitials(entry.actorName)
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="text-sm font-medium text-secondary-800">
                    {entry.actorName}
                  </span>
                  <span className="text-xs text-secondary-400">{entry.actorRole}</span>
                  <span className="ml-auto text-xs text-secondary-400 shrink-0">
                    {formatDate(entry.timestamp)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-secondary-700">{entry.action}</p>
                {entry.detail && (
                  <p className="mt-0.5 text-xs text-secondary-500">{entry.detail}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
