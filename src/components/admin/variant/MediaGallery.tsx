"use client";

import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { MediaItemCard } from "./MediaItemCard";
import type { VariantMedia } from "@/src/types/product.types";

// ─── MediaGallery ─────────────────────────────────────────────────────────────

interface MediaGalleryProps {
  media: VariantMedia[];
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const sorted = [...media].sort((a, b) => a.order - b.order);

  const byType = {
    all:     sorted,
    main:    sorted.filter((m) => m.type === "main"),
    gallery: sorted.filter((m) => m.type === "gallery"),
    "360":   sorted.filter((m) => m.type === "360"),
  };

  const tabs = [
    { value: "all",     label: `All (${byType.all.length})` },
    { value: "main",    label: `Main (${byType.main.length})` },
    { value: "gallery", label: `Gallery (${byType.gallery.length})` },
    { value: "360",     label: `360° (${byType["360"].length})` },
  ];

  return (
    <div className="rounded-xl border border-secondary-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="px-6 pt-6 pb-0">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary-500">
          Media
        </h2>
      </div>

      <Tabs
        tabs={tabs}
        defaultValue="all"
        className="border-b border-secondary-200 px-6 mt-4"
      >
        {(["all", "main", "gallery", "360"] as const).map((key) => (
          <TabPanel key={key} value={key} className="p-6">
            <MediaGrid items={byType[key]} />
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}

// ── MediaGrid ─────────────────────────────────────────────────────────────────

function MediaGrid({ items }: { items: VariantMedia[] }) {
  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-secondary-400">
        No media in this category.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <MediaItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
