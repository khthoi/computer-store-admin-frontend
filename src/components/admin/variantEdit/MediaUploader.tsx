"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import type { MediaType, VariantMedia } from "@/src/types/product.types";

// ─── MediaUploader ────────────────────────────────────────────────────────────

interface MediaUploaderProps {
  onAdd: (item: Omit<VariantMedia, "id" | "variantId">) => void;
}

const EMPTY = { url: "", type: "gallery" as MediaType, altText: "" };

const TYPE_OPTIONS: { value: MediaType; label: string }[] = [
  { value: "main",    label: "Main" },
  { value: "gallery", label: "Gallery" },
  { value: "360",     label: "360°" },
];

export function MediaUploader({ onAdd }: MediaUploaderProps) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  function set(field: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleAdd() {
    if (!form.url.trim()) {
      setError("URL is required.");
      return;
    }
    setError("");
    onAdd({ url: form.url.trim(), type: form.type, altText: form.altText.trim() || undefined, order: 0 });
    setForm(EMPTY);
  }

  return (
    <div className="rounded-xl border border-dashed border-secondary-300 bg-secondary-50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary-500">
        Add Media
      </p>

      <div className="space-y-3">
        <Input
          label="Image URL"
          value={form.url}
          onChange={set("url")}
          placeholder="https://example.com/image.png"
          errorMessage={error}
          size="sm"
        />

        {/* Preview */}
        {form.url && (
          <div className="h-24 w-24 overflow-hidden rounded-lg border border-secondary-200 bg-white">
            <img
              src={form.url}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "";
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Alt text"
            value={form.altText}
            onChange={set("altText")}
            placeholder="Describe image…"
            size="sm"
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700">Type</label>
            <select
              value={form.type}
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

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Add to Gallery
        </button>
      </div>
    </div>
  );
}
