"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { PlusIcon, TrashIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Select } from "@/src/components/ui/Select";
import type { SocialLink, SocialPlatform } from "@/src/types/content.types";

// ─── Platform config ───────────────────────────────────────────────────────────

export const SOCIAL_PLATFORM_CFG: {
  value: SocialPlatform;
  label: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "facebook",
    label: "Facebook",
    color: "#1877f2",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    value: "youtube",
    label: "YouTube",
    color: "#ff0000",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    value: "instagram",
    label: "Instagram",
    color: "#e4405f",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    value: "tiktok",
    label: "TikTok",
    color: "#010101",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    value: "zalo",
    label: "Zalo",
    color: "#0068ff",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 16.5h-7l4.5-6H8V9h7l-4.5 6H17.5v1.5z" />
      </svg>
    ),
  },
  {
    value: "twitter",
    label: "X (Twitter)",
    color: "#14171a",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    color: "#0077b5",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

// ─── Sortable row ──────────────────────────────────────────────────────────────

function SortableSocialRow({
  social,
  optionsForRow,
  onPlatformChange,
  onUrlChange,
  onRemove,
  onDragEnd,
}: {
  social: SocialLink;
  optionsForRow: { value: string; label: string }[];
  onPlatformChange: (platform: SocialPlatform) => void;
  onUrlChange: (url: string) => void;
  onRemove: () => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const cfg = SOCIAL_PLATFORM_CFG.find((p) => p.value === social.platform);

  return (
    <Reorder.Item
      value={social}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => { setIsDragging(false); onDragEnd(); }}
      style={{ userSelect: "none", zIndex: isDragging ? 50 : "auto", position: "relative" }}
      animate={
        isDragging
          ? { scale: 1.015, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }
          : { scale: 1, boxShadow: "0 0px 0px rgba(0,0,0,0.00)" }
      }
      className="group flex cursor-default items-center gap-3 rounded-lg border border-secondary-200 bg-white px-3 py-2.5 transition-colors hover:border-secondary-300 hover:bg-secondary-50"
    >
      {/* Drag handle */}
      <span
        className="shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing"
        onPointerDown={(e) => {
          e.preventDefault();
          controls.start(e);
        }}
      >
        <Bars3Icon className="h-4 w-4" />
      </span>

      {/* Platform icon */}
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full p-1.5 text-white"
        style={{ backgroundColor: cfg?.color ?? "#888" }}
      >
        {cfg?.icon}
      </span>

      {/* Platform selector */}
      <div className="w-40 shrink-0">
        <Select
          options={optionsForRow}
          value={social.platform}
          onChange={(v) =>
            onPlatformChange((Array.isArray(v) ? v[0] : v) as SocialPlatform)
          }
          placeholder="Chọn nền tảng"
        />
      </div>

      {/* URL input */}
      <div className="flex-1">
        <Input
          type="url"
          placeholder="https://facebook.com/pcstore"
          value={social.url}
          onChange={(e) => onUrlChange(e.target.value)}
        />
      </div>

      {/* Remove */}
      <Tooltip content="Xóa" placement="top">
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-lg p-2 text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </Tooltip>
    </Reorder.Item>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function SocialLinksEditor({
  value,
  onChange,
  onSave,
  isSaving,
}: {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
  onSave?: () => void;
  isSaving?: boolean;
}) {
  const [items, setItems] = useState<SocialLink[]>(() => [...value]);
  const [isDirty, setIsDirty] = useState(false);

  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // Sync from parent on initial load (e.g., after async fetch)
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    setItems([...value]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mutations ────────────────────────────────────────────────────────────────

  function setPlatform(idx: number, platform: SocialPlatform) {
    const next = items.map((s, i) => (i === idx ? { ...s, platform } : s));
    setItems(next);
    onChange(next);
  }

  function setUrl(idx: number, url: string) {
    const next = items.map((s, i) => (i === idx ? { ...s, url } : s));
    setItems(next);
    onChange(next);
  }

  function remove(idx: number) {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    onChange(next);
  }

  function add() {
    const used = new Set(items.map((s) => s.platform));
    const next = SOCIAL_PLATFORM_CFG.find((p) => !used.has(p.value));
    if (next) {
      const updated = [...items, { platform: next.value, url: "" }];
      setItems(updated);
      onChange(updated);
    }
  }

  // ── Drag handlers ─────────────────────────────────────────────────────────

  function handleReorder(newOrder: SocialLink[]) {
    setItems(newOrder);
  }

  const handleDragEnd = useCallback(() => {
    onChange(itemsRef.current);
    setIsDirty(true);
  }, [onChange]);

  async function handleSaveOrder() {
    onSave?.();
    setIsDirty(false);
  }

  // ── Per-row options (exclude platforms already used by other rows) ─────────

  function optionsForRow(idx: number) {
    const usedByOthers = new Set(
      items.filter((_, i) => i !== idx).map((s) => s.platform)
    );
    return SOCIAL_PLATFORM_CFG.filter((p) => !usedByOthers.has(p.value)).map((p) => ({
      value: p.value,
      label: p.label,
    }));
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-secondary-400">
          {items.length} mạng xã hội
          {items.length > 1 && (
            <span className="ml-1.5 text-secondary-300">
              · kéo <Bars3Icon className="inline h-3 w-3" /> để sắp xếp
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          {isDirty && onSave && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveOrder}
              isLoading={isSaving}
              type="button"
            >
              Lưu thứ tự
            </Button>
          )}
          {items.length < SOCIAL_PLATFORM_CFG.length && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<PlusIcon className="h-3.5 w-3.5" />}
              onClick={add}
              type="button"
            >
              Thêm mạng xã hội
            </Button>
          )}
        </div>
      </div>

      {/* Sortable list */}
      {items.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-secondary-200 py-8">
          <p className="text-sm text-secondary-400">Chưa có mạng xã hội nào.</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={handleReorder}
          as="div"
          className="flex flex-col gap-1.5"
          style={{ touchAction: "none" }}
        >
          {items.map((social, idx) => (
            <SortableSocialRow
              key={social.platform}
              social={social}
              optionsForRow={optionsForRow(idx)}
              onPlatformChange={(p) => setPlatform(idx, p)}
              onUrlChange={(u) => setUrl(idx, u)}
              onRemove={() => remove(idx)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
