"use client";

import { useState } from "react";
import {
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FolderOpenIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Badge } from "@/src/components/ui/Badge";
import { MediaUploader } from "./MediaUploader";
import type { VariantMedia, MediaType } from "@/src/types/product.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "main",    label: "Main"    },
  { value: "gallery", label: "Gallery" },
  { value: "360",     label: "360°"    },
];

const TYPE_BADGE: Record<MediaType, React.ReactNode> = {
  main:    <Badge variant="primary" size="sm">Main</Badge>,
  gallery: <Badge variant="default" size="sm">Gallery</Badge>,
  "360":   <Badge variant="warning" size="sm">360°</Badge>,
};

// ─── Source badge ─────────────────────────────────────────────────────────────

function SourceBadge({ assetId }: { assetId?: string | null }) {
  if (assetId) {
    return (
      <span className="inline-flex h-5 items-center gap-1 rounded px-1.5 text-xs font-semibold bg-primary-100 text-primary-700 border border-primary-200">
        <FolderOpenIcon className="h-3 w-3" aria-hidden />
        Thư viện
      </span>
    );
  }
  return (
    <span className="inline-flex h-5 items-center gap-1 rounded px-1.5 text-xs font-semibold bg-secondary-100 text-secondary-700 border border-secondary-200">
      <LinkIcon className="h-3 w-3" aria-hidden />
      URL
    </span>
  );
}

// ─── MediaManager ─────────────────────────────────────────────────────────────

interface MediaManagerProps {
  variantId: string;
  media: VariantMedia[];
  onChange: (media: VariantMedia[]) => void;
}

export function MediaManager({ variantId, media, onChange }: MediaManagerProps) {
  const sorted = [...media].sort((a, b) => a.order - b.order);

  const [libraryOpen,     setLibraryOpen]     = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Add item ──────────────────────────────────────────────────────────────

  function addItem(item: Omit<VariantMedia, "id" | "variantId" | "order">) {
    const maxOrder = media.reduce((m, x) => Math.max(m, x.order), 0);
    onChange([
      ...media,
      { ...item, id: `media-new-${Date.now()}`, variantId, order: maxOrder + 1 },
    ]);
  }

  // ── Reorder ───────────────────────────────────────────────────────────────

  function swapOrders(idA: string, idB: string) {
    const a = media.find((m) => m.id === idA)!;
    const b = media.find((m) => m.id === idB)!;
    onChange(
      media.map((m) => {
        if (m.id === idA) return { ...m, order: b.order };
        if (m.id === idB) return { ...m, order: a.order };
        return m;
      })
    );
  }

  function handleMoveUp(id: string) {
    const idx = sorted.findIndex((m) => m.id === id);
    if (idx <= 0) return;
    swapOrders(sorted[idx].id, sorted[idx - 1].id);
  }

  function handleMoveDown(id: string) {
    const idx = sorted.findIndex((m) => m.id === id);
    if (idx < 0 || idx >= sorted.length - 1) return;
    swapOrders(sorted[idx].id, sorted[idx + 1].id);
  }

  function handleEdit(updated: VariantMedia) {
    onChange(media.map((m) => (m.id === updated.id ? updated : m)));
  }

  function handleRemove(id: string) {
    onChange(media.filter((m) => m.id !== id));
    setConfirmDeleteId(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      {/* Card header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary-500">
          Media
          {media.length > 0 && (
            <span className="ml-1.5 font-normal text-secondary-400">({media.length})</span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
        >
          <PlusIcon className="h-4 w-4" aria-hidden />
          Quản lý ảnh
        </button>
      </div>

      {/* Thumbnail grid preview */}
      {sorted.length === 0 ? (
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-secondary-200 py-10 text-secondary-400 transition-colors hover:border-primary-300 hover:text-primary-500"
        >
          <PhotoIcon className="mb-2 h-10 w-10" aria-hidden />
          <span className="text-sm">Chưa có ảnh. Nhấn để thêm ảnh.</span>
        </button>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setLibraryOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLibraryOpen(true); }}
          aria-label="Mở quản lý ảnh"
          className="grid cursor-pointer grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-8"
        >
          {sorted.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-secondary-200 bg-secondary-50"
            >
              {item.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={item.altText ?? ""} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <PhotoIcon className="h-5 w-5 text-secondary-300" />
                </div>
              )}
              {/* Source dot */}
              <span
                className={[
                  "absolute right-0.5 top-0.5 h-2 w-2 rounded-full border border-white",
                  item.assetId ? "bg-primary-500" : "bg-secondary-400",
                ].join(" ")}
                title={item.assetId ? "Từ thư viện" : "URL trực tiếp"}
              />
              <span className="absolute bottom-0.5 left-0.5 rounded bg-black/50 px-1 py-0.5 font-mono text-[8px] text-white">
                {item.type}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ══ Media Library Modal ══════════════════════════════════════════════ */}
      <Modal
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        title="Quản lý ảnh sản phẩm"
        size="4xl"
        animated
      >
        <div className="space-y-5">
          {/* Uploader */}
          <MediaUploader
            onAdd={(item) => addItem(item)}
          />

          {/* Media list */}
          {sorted.length === 0 ? (
            <p className="py-8 text-center text-sm text-secondary-400">
              Chưa có ảnh nào. Thêm ảnh bằng bảng phía trên.
            </p>
          ) : (
            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {sorted.map((item, index) => (
                <MediaItemRow
                  key={item.id}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === sorted.length - 1}
                  onMoveUp={() => handleMoveUp(item.id)}
                  onMoveDown={() => handleMoveDown(item.id)}
                  onRemove={() => setConfirmDeleteId(item.id)}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* ══ Confirm delete modal ═════════════════════════════════════════════ */}
      <Modal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Xóa ảnh này?"
        size="sm"
        animated
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={() => handleRemove(confirmDeleteId!)}>
              Xóa
            </Button>
          </>
        }
      >
        <p className="text-sm text-secondary-600">
          Ảnh sẽ bị xóa khỏi phiên bản này. Thao tác không thể hoàn tác nếu không thêm lại.
        </p>
      </Modal>
    </div>
  );
}

// ─── MediaItemRow ─────────────────────────────────────────────────────────────

interface MediaItemRowProps {
  item: VariantMedia;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onEdit: (item: VariantMedia) => void;
}

function MediaItemRow({
  item,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
  onEdit,
}: MediaItemRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-secondary-200 bg-white p-3 shadow-sm">
      {/* Thumbnail */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-secondary-200 bg-secondary-50">
        {item.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.altText ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PhotoIcon className="h-6 w-6 text-secondary-300" aria-hidden />
          </div>
        )}
        <span className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 py-0.5 font-mono text-[9px] font-semibold text-white">
          #{item.order}
        </span>
      </div>

      {/* Editable fields */}
      <div className="min-w-0 flex-1 space-y-2">
        {/* Row 1: Alt text + Type */}
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              label="Alt text"
              value={item.altText ?? ""}
              onChange={(e) => onEdit({ ...item, altText: e.target.value || undefined })}
              placeholder="Mô tả ngắn cho SEO & screen reader…"
              helperText="Dùng cho SEO và trình đọc màn hình"
              size="sm"
            />
          </div>
          <div className="w-32 shrink-0">
            <Select
              label="Loại"
              options={TYPE_OPTIONS}
              value={item.type}
              onChange={(v) => onEdit({ ...item, type: v as MediaType })}
              size="sm"
            />
          </div>
        </div>

        {/* Row 2: Caption */}
        <Input
          label="Caption"
          value={item.caption ?? ""}
          onChange={(e) => onEdit({ ...item, caption: e.target.value || undefined })}
          placeholder="Chú thích hiển thị bên dưới ảnh trên storefront…"
          helperText="Không bắt buộc — hiển thị bên dưới ảnh"
          size="sm"
        />

        {/* Row 3: Badges */}
        <div className="flex items-center gap-2">
          {TYPE_BADGE[item.type]}
          <SourceBadge assetId={item.assetId} />
        </div>
      </div>

      {/* Move + delete */}
      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          title="Di chuyển lên"
          className="flex h-7 w-7 items-center justify-center rounded border border-secondary-200 text-secondary-500 transition-colors hover:bg-secondary-50 hover:text-secondary-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowUpIcon className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          title="Di chuyển xuống"
          className="flex h-7 w-7 items-center justify-center rounded border border-secondary-200 text-secondary-500 transition-colors hover:bg-secondary-50 hover:text-secondary-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowDownIcon className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onRemove}
          title="Xóa"
          className="mt-auto flex h-7 w-7 items-center justify-center rounded border border-error-200 text-error-500 transition-colors hover:bg-error-50 hover:text-error-700"
        >
          <TrashIcon className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
