"use client";

import { ProductImageGallery, type GalleryMedia } from "@/src/components/product/ProductImageGallery";
import type { VariantMedia } from "@/src/types/product.types";

// ─── MediaGallery ─────────────────────────────────────────────────────────────
//
// Wraps ProductImageGallery for use on the variant detail page.
// Converts VariantMedia[] → GalleryMedia[], sorted by order.
// Clicking any image opens the built-in lightbox.

interface MediaGalleryProps {
  media: VariantMedia[];
}

function toGalleryItem(m: VariantMedia): GalleryMedia {
  return {
    key: m.id,
    src: m.url,
    alt: m.altText ?? m.type,
    type: "image",
  };
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const items = [...media].sort((a, b) => a.order - b.order).map(toGalleryItem);

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
        Media
      </h2>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-secondary-400">
          No media available.
        </p>
      ) : (
        /* Constrain the gallery to a comfortable viewing size.
           max-w-sm = 384px on small/medium, relaxes to max-w-md = 448px on xl+.
           mx-auto centres it inside the wider right column. */
        <div className="mx-auto max-w-sm xl:max-w-md">
          <ProductImageGallery items={items} />
        </div>
      )}
    </div>
  );
}
