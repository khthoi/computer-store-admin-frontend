"use client";

import { useEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  MagnifyingGlassIcon, XMarkIcon, Bars3Icon, PhotoIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Spinner } from "@/src/components/ui/Spinner";
import { searchProducts, getDanhMucOptions } from "@/src/services/homepage.service";
import type { PreviewProduct, SectionItem, DanhMucOption } from "@/src/types/homepage.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

// ─── Sortable selected item row ───────────────────────────────────────────────

function SortableSelectedRow({
  item,
  index,
  onRemove,
}: {
  item: SectionItem;
  index: number;
  onRemove: (id: number) => void;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item
      value={item}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{ userSelect: "none", zIndex: isDragging ? 50 : "auto", position: "relative" }}
      animate={isDragging
        ? { scale: 1.02, boxShadow: "0 6px 20px rgba(0,0,0,0.10)" }
        : { scale: 1,    boxShadow: "0 0px 0px rgba(0,0,0,0)" }
      }
      className="flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-2.5 py-2"
    >
      <span
        className="shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500"
        onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
      >
        <Bars3Icon className="h-3.5 w-3.5" />
      </span>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-[10px] font-bold text-secondary-500">
        {index}
      </span>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary-50 overflow-hidden">
        {item.hinhAnh
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={item.hinhAnh} alt="" className="h-full w-full object-cover" />
          : <PhotoIcon className="h-4 w-4 text-secondary-300" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="select-none truncate text-xs font-medium text-secondary-800">{item.tenSanPham}</p>
        <p className="select-none text-[10px] text-secondary-400 font-mono">{item.SKU}</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.phienBanId)}
        className="shrink-0 rounded-md p-1 text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
      >
        <XMarkIcon className="h-3.5 w-3.5" />
      </button>
    </Reorder.Item>
  );
}

// ─── Product search result row ────────────────────────────────────────────────

function ProductRow({
  product,
  selected,
  onToggle,
}: {
  product: PreviewProduct;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
        selected
          ? "bg-primary-50 ring-1 ring-inset ring-primary-200"
          : "hover:bg-secondary-50",
      ].join(" ")}
    >
      {/* Checkbox visual */}
      <span
        className={[
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
          selected
            ? "border-primary-500 bg-primary-500"
            : "border-secondary-300 bg-white",
        ].join(" ")}
      >
        {selected && (
          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      {/* Product thumbnail */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-50 overflow-hidden">
        {product.hinhAnh
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={product.hinhAnh} alt="" className="h-full w-full object-cover" />
          : <PhotoIcon className="h-5 w-5 text-secondary-300" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-secondary-800">{product.tenSanPham}</p>
        <p className="text-xs text-secondary-400 font-mono">{product.SKU}</p>
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-primary-600">{formatPrice(product.giaBan)}</p>
        {product.giaGoc > product.giaBan && (
          <p className="text-[10px] text-secondary-400 line-through">{formatPrice(product.giaGoc)}</p>
        )}
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface ProductPickerModalProps {
  initialItems: SectionItem[];
  onClose: () => void;
  onConfirm: (items: SectionItem[]) => void;
}

export function ProductPickerModal({
  initialItems,
  onClose,
  onConfirm,
}: ProductPickerModalProps) {
  const [query, setQuery] = useState("");
  const [danhMucId, setDanhMucId] = useState<number | undefined>();
  const [danhMucOptions, setDanhMucOptions] = useState<DanhMucOption[]>([]);
  const [searchResults, setSearchResults] = useState<PreviewProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Selected items (right panel) — sortable
  const [selected, setSelected] = useState<SectionItem[]>(initialItems);
  const selectedRef = useRef(selected);
  const syncSelected = (next: SectionItem[]) => {
    setSelected(next);
    selectedRef.current = next;
  };

  // Selected phienBanIds set for fast lookup
  const selectedIds = new Set(selected.map((i) => i.phienBanId));

  // Load reference data
  useEffect(() => {
    getDanhMucOptions().then(setDanhMucOptions);
  }, []);

  // Search on query/category change
  useEffect(() => {
    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchProducts(query, danhMucId);
        if (!cancelled) setSearchResults(results);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, danhMucId]);

  function toggleProduct(product: PreviewProduct) {
    if (selectedIds.has(product.phienBanId)) {
      syncSelected(selected.filter((i) => i.phienBanId !== product.phienBanId));
    } else {
      const newItem: SectionItem = {
        id: 0,
        sectionId: 0,
        phienBanId: product.phienBanId,
        sortOrder: selectedRef.current.length + 1,
        tenSanPham: product.tenSanPham,
        SKU: product.SKU,
        giaBan: product.giaBan,
        giaGoc: product.giaGoc,
        hinhAnh: product.hinhAnh,
      };
      syncSelected([...selectedRef.current, newItem]);
    }
  }

  function handleReorder(newOrder: SectionItem[]) {
    syncSelected(newOrder);
  }

  const categorySelectOptions = danhMucOptions.map((d) => ({
    value: String(d.value),
    label: d.label,
    description: d.description,
  }));

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Chọn sản phẩm"
      size="7xl"
      animated
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button
            variant="primary"
            onClick={() => onConfirm(selected.map((item, idx) => ({ ...item, sortOrder: idx + 1 })))}
            disabled={selected.length === 0}
          >
            Xác nhận ({selected.length} sản phẩm)
          </Button>
        </>
      }
    >
      <div className="flex h-[60vh] gap-4 overflow-hidden">
        {/* ── Left: Search panel ───────────────────────────────────────── */}
        <div className="flex w-[55%] shrink-0 flex-col gap-3">
          {/* Filters */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Tìm tên sản phẩm, SKU…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                prefixIcon={<MagnifyingGlassIcon className="h-4 w-4 text-secondary-400" />}
                size="sm"
              />
            </div>
            <div className="w-54 shrink-0">
              <Select
                options={categorySelectOptions}
                value={danhMucId !== undefined ? String(danhMucId) : undefined}
                onChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setDanhMucId(val ? Number(val) : undefined);
                }}
                placeholder="Tất cả danh mục"
                clearable
                searchable
                size="sm"
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-secondary-200 bg-secondary-50 p-2">
            {isSearching ? (
              <div className="flex h-full items-center justify-center">
                <Spinner size="md" color="primary" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-secondary-400">Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {searchResults.map((product) => (
                  <ProductRow
                    key={product.phienBanId}
                    product={product}
                    selected={selectedIds.has(product.phienBanId)}
                    onToggle={() => toggleProduct(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className="w-px shrink-0 bg-secondary-200" />

        {/* ── Right: Selected panel ────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-secondary-700">
              Đã chọn
              <span className="ml-1.5 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">
                {selected.length}
              </span>
            </p>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => syncSelected([])}
                className="text-xs text-secondary-400 hover:text-error-500 transition-colors"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {selected.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-secondary-200">
                <p className="text-xs text-secondary-400">Chọn sản phẩm từ danh sách bên trái</p>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={selected}
                onReorder={handleReorder}
                as="div"
                className="flex flex-col gap-1.5"
                style={{ touchAction: "none" }}
              >
                {selected.map((item, idx) => (
                  <SortableSelectedRow
                    key={item.phienBanId}
                    item={item}
                    index={idx + 1}
                    onRemove={(id) =>
                      syncSelected(selectedRef.current.filter((i) => i.phienBanId !== id))
                    }
                  />
                ))}
              </Reorder.Group>
            )}
          </div>

          <p className="text-[10px] text-secondary-400">
            Kéo <Bars3Icon className="inline h-3 w-3" /> để sắp xếp thứ tự hiển thị
          </p>
        </div>
      </div>
    </Modal>
  );
}
