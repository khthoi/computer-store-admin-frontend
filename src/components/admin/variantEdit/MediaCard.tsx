"use client";

import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { Input } from "@/src/components/ui/Input";
import type { VariantMedia, MediaType } from "@/src/types/product.types";

// ─── MediaCard ────────────────────────────────────────────────────────────────

interface MediaCardProps {
  item: VariantMedia;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onEdit: (item: VariantMedia) => void;
}

const TYPE_BADGE: Record<MediaType, React.ReactNode> = {
  main:    <Badge variant="primary" size="sm">Main</Badge>,
  gallery: <Badge variant="default" size="sm">Gallery</Badge>,
  "360":   <Badge variant="warning" size="sm">360°</Badge>,
};

const TYPE_OPTIONS: { value: MediaType; label: string }[] = [
  { value: "main",    label: "Main" },
  { value: "gallery", label: "Gallery" },
  { value: "360",     label: "360°" },
];

export function MediaCard({
  item,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
  onEdit,
}: MediaCardProps) {
  function set(field: keyof VariantMedia) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onEdit({ ...item, [field]: e.target.value });
  }

  return (
    <div className="flex gap-4 rounded-xl border border-secondary-200 bg-white p-4 shadow-sm">
      {/* Thumbnail */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-secondary-200 bg-secondary-50">
        {item.url ? (
          <img
            src={item.url}
            alt={item.altText ?? ""}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-secondary-400">No image</span>
          </div>
        )}
        {/* Order badge */}
        <span className="absolute left-1 top-1 rounded bg-black/60 px-1 py-0.5 font-mono text-[9px] font-semibold text-white">
          #{item.order}
        </span>
      </div>

      {/* Editable fields */}
      <div className="min-w-0 flex-1 space-y-2">
        <Input
          label="URL"
          value={item.url}
          onChange={set("url")}
          placeholder="https://..."
          size="sm"
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Alt text"
            value={item.altText ?? ""}
            onChange={set("altText")}
            placeholder="Describe image…"
            size="sm"
          />

          {/* Type select */}
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700">
              Type
            </label>
            <select
              value={item.type}
              onChange={set("type")}
              className="h-8 w-full rounded border border-secondary-300 bg-white px-3 text-sm text-secondary-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type preview badge */}
        <div>{TYPE_BADGE[item.type]}</div>
      </div>

      {/* Move + delete actions */}
      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          title="Move up"
          className="flex h-7 w-7 items-center justify-center rounded border border-secondary-200 text-secondary-500 transition-colors hover:bg-secondary-50 hover:text-secondary-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowUpIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          title="Move down"
          className="flex h-7 w-7 items-center justify-center rounded border border-secondary-200 text-secondary-500 transition-colors hover:bg-secondary-50 hover:text-secondary-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowDownIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          title="Remove"
          className="mt-auto flex h-7 w-7 items-center justify-center rounded border border-error-200 text-error-500 transition-colors hover:bg-error-50 hover:text-error-700"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
