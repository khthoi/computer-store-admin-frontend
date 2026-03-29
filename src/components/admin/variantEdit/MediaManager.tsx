"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { MediaUploader } from "./MediaUploader";
import { MediaList } from "./MediaList";
import type { VariantMedia } from "@/src/types/product.types";

// ─── MediaManager ─────────────────────────────────────────────────────────────

interface MediaManagerProps {
  variantId: string;
  media: VariantMedia[];
  onChange: (media: VariantMedia[]) => void;
}

export function MediaManager({ variantId, media, onChange }: MediaManagerProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const sorted = [...media].sort((a, b) => a.order - b.order);

  // ── Add ───────────────────────────────────────────────────────────────────

  function handleAdd(item: Omit<VariantMedia, "id" | "variantId">) {
    const maxOrder = media.reduce((m, x) => Math.max(m, x.order), 0);
    const newItem: VariantMedia = {
      ...item,
      id: `media-new-${Date.now()}`,
      variantId,
      order: maxOrder + 1,
    };
    onChange([...media, newItem]);
  }

  // ── Remove ─────────────────────────────────────────────────────────────────

  function confirmRemove(id: string) {
    setConfirmDeleteId(id);
  }

  function handleConfirmRemove() {
    if (!confirmDeleteId) return;
    onChange(media.filter((m) => m.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  }

  // ── Reorder ───────────────────────────────────────────────────────────────

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

  // ── Inline edit ───────────────────────────────────────────────────────────

  function handleEdit(updated: VariantMedia) {
    onChange(media.map((m) => (m.id === updated.id ? updated : m)));
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
        Media
      </h2>

      <div className="space-y-4">
        <MediaUploader onAdd={handleAdd} />
        <MediaList
          items={sorted}
          onRemove={confirmRemove}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onEdit={handleEdit}
        />
      </div>

      {/* Confirm delete modal */}
      <Modal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Remove media item?"
        size="sm"
        animated
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="rounded-lg border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              Cancel
            </button>
            <Button variant="danger" onClick={handleConfirmRemove}>
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-secondary-600">
          This media item will be removed from the variant. This cannot be undone without re-adding it.
        </p>
      </Modal>
    </div>
  );
}
