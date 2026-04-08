"use client";

import { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Spinner } from "@/src/components/ui/Spinner";
import { searchVariantsForFlashSale } from "@/src/services/flash-sale.service";
import { formatVND } from "@/src/lib/format";
import type { VariantSearchResult } from "@/src/types/flash-sale.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface VariantPickerModalProps {
  open:       boolean;
  onClose:    () => void;
  onSelect:   (variant: VariantSearchResult) => void;
  /** phienBanId values already in the editor — these are excluded from results */
  excludeIds: number[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VariantPickerModal({
  open,
  onClose,
  onSelect,
  excludeIds,
}: VariantPickerModalProps) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<VariantSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchVariantsForFlashSale(query);
        setResults(data.filter((v) => !excludeIds.includes(v.phienBanId)));
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, excludeIds]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelect(variant: VariantSearchResult) {
    onSelect(variant);
    onClose();
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Chọn phiên bản sản phẩm"
      size="lg"
    >
      {/* Search input */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Tìm theo tên sản phẩm, phiên bản hoặc SKU…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full h-10 rounded-xl border border-secondary-200 bg-white pl-9 pr-4 text-sm text-secondary-800 placeholder-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto -mx-6 px-6 space-y-1">
        {!query.trim() && (
          <p className="py-8 text-center text-sm text-secondary-400">
            Nhập từ khoá để tìm kiếm phiên bản sản phẩm.
          </p>
        )}

        {query.trim() && !loading && results.length === 0 && (
          <p className="py-8 text-center text-sm text-secondary-400">
            Không tìm thấy kết quả cho &ldquo;{query}&rdquo;.
          </p>
        )}

        {results.map((variant) => (
          <button
            key={variant.phienBanId}
            type="button"
            onClick={() => handleSelect(variant)}
            className="w-full flex items-center gap-3 rounded-xl p-3 text-left hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {/* Thumbnail */}
            <div className="shrink-0 h-12 w-12 rounded-lg border border-secondary-100 bg-secondary-50 flex items-center justify-center overflow-hidden">
              {variant.hinhAnh ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={variant.hinhAnh}
                  alt={variant.tenPhienBan}
                  className="h-full w-full object-cover"
                />
              ) : (
                <PhotoIcon className="h-6 w-6 text-secondary-300" aria-hidden="true" />
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-secondary-500 truncate">{variant.sanPhamTen}</p>
              <p className="text-sm font-medium text-secondary-900 truncate">
                {variant.tenPhienBan}
              </p>
              <p className="font-mono text-xs text-secondary-400 mt-0.5">{variant.sku}</p>
            </div>

            {/* Price + stock */}
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-secondary-900">
                {formatVND(variant.giaBan)}
              </p>
              <p className="text-xs text-secondary-400 mt-0.5">
                Tồn: {variant.tonKho}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
