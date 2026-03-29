import { Badge } from "@/src/components/ui/Badge";
import type { VariantMedia, MediaType } from "@/src/types/product.types";

// ─── MediaItemCard ────────────────────────────────────────────────────────────

interface MediaItemCardProps {
  item: VariantMedia;
}

const TYPE_BADGE: Record<MediaType, React.ReactNode> = {
  main:    <Badge variant="primary" size="sm">Main</Badge>,
  gallery: <Badge variant="default" size="sm">Gallery</Badge>,
  "360":   <Badge variant="warning" size="sm">360°</Badge>,
};

export function MediaItemCard({ item }: MediaItemCardProps) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-secondary-200 bg-secondary-50">
      {/* Image */}
      <img
        src={item.url}
        alt={item.altText ?? ""}
        className="h-full w-full object-cover"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Order — top left */}
        <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
          #{item.order}
        </span>

        {/* Type badge — top right */}
        <span className="absolute right-2 top-2">
          {TYPE_BADGE[item.type]}
        </span>

        {/* Alt text — bottom */}
        {item.altText && (
          <span className="absolute bottom-2 left-2 right-2 truncate rounded bg-black/60 px-2 py-1 text-[10px] text-white">
            {item.altText}
          </span>
        )}
      </div>
    </div>
  );
}
