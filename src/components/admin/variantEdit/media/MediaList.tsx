"use client";

import { MediaCard } from "./MediaCard";
import type { VariantMedia } from "@/src/types/product.types";

// ─── MediaList ────────────────────────────────────────────────────────────────

interface MediaListProps {
  items: VariantMedia[];
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onEdit: (item: VariantMedia) => void;
}

export function MediaList({ items, onRemove, onMoveUp, onMoveDown, onEdit }: MediaListProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-secondary-400">
        No media added yet. Use the form above to add images.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <MediaCard
          key={item.id}
          item={item}
          isFirst={index === 0}
          isLast={index === items.length - 1}
          onMoveUp={() => onMoveUp(item.id)}
          onMoveDown={() => onMoveDown(item.id)}
          onRemove={() => onRemove(item.id)}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
