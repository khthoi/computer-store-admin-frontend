"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  CheckIcon,
  FolderIcon,
  FolderOpenIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CategoryOption {
  value: string;
  label: string; // format: ["└─* "]<name>  where depth = number of "─" chars
}

export interface CategoryParentPickerProps {
  label?: string;
  options: CategoryOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Name of the category currently being edited — shown as a note below the trigger */
  editingCategoryName?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseLabelDepth(label: string): { depth: number; name: string } {
  const match = label.match(/^(└─*\s)/);
  if (!match) return { depth: 0, name: label };
  return { depth: match[1].length - 2, name: label.slice(match[1].length) };
}

/** Walk backwards through the flat sorted list to build an ancestor breadcrumb. */
function buildAncestorPath(options: CategoryOption[], targetValue: string): string[] {
  const parsed = options.map((o) => ({ value: o.value, ...parseLabelDepth(o.label) }));
  const targetIdx = parsed.findIndex((o) => o.value === targetValue);
  if (targetIdx === -1) return [];

  const ancestors: string[] = [];
  let currentDepth = parsed[targetIdx].depth;

  for (let i = targetIdx - 1; i >= 0 && currentDepth > 0; i--) {
    if (parsed[i].depth < currentDepth) {
      ancestors.unshift(parsed[i].name);
      currentDepth = parsed[i].depth;
    }
  }
  return ancestors;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function CategoryParentPicker({
  label = "Danh mục cha",
  options,
  value,
  onChange,
  placeholder = "(Không có — danh mục gốc)",
  editingCategoryName,
}: CategoryParentPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRowRef = useRef<HTMLButtonElement>(null);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ── Scroll selected item into view when dropdown opens ─────────────────────
  useEffect(() => {
    if (open && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [open]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const selectedOption = options.find((o) => o.value === value);
  const selectedName = selectedOption ? parseLabelDepth(selectedOption.label).name : null;
  const ancestorPath = value ? buildAncestorPath(options, value) : [];

  const q = search.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => parseLabelDepth(o.label).name.toLowerCase().includes(q))
    : options;

  function pick(v: string) {
    onChange(v);
    setOpen(false);
    setSearch("");
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative" ref={containerRef}>
      {/* Label */}
      <label className="mb-1.5 block text-sm font-medium text-secondary-700">{label}</label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white ${
          open
            ? "border-primary-400 ring-2 ring-primary-200"
            : "border-secondary-200 hover:border-secondary-300"
        }`}
      >
        <span className="flex items-center gap-1.5 min-w-0 truncate">
          {selectedName ? (
            <>
              {/* Ancestor breadcrumb */}
              {ancestorPath.map((seg) => (
                <span key={seg} className="flex items-center gap-1 text-secondary-400 shrink-0">
                  <span className="truncate max-w-[80px]">{seg}</span>
                  <ChevronRightIcon className="h-3 w-3 shrink-0" />
                </span>
              ))}
              <span className="font-medium text-secondary-900 truncate">{selectedName}</span>
            </>
          ) : (
            <span className="text-secondary-400 italic">{placeholder}</span>
          )}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-secondary-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Info note when editing */}
      {editingCategoryName && (
        <p className="mt-1 text-[11px] text-secondary-400">
          Danh mục&nbsp;<span className="font-medium text-secondary-600">{editingCategoryName}</span>&nbsp;và các
          danh mục con của danh mục này đã được loại khỏi danh sách.
        </p>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-secondary-200 bg-white shadow-xl overflow-hidden">
          {/* Search bar */}
          <div className="p-2 border-b border-secondary-100 bg-secondary-50">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm danh mục…"
              className="w-full rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-sm focus:border-primary-400 focus:outline-none"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* "None" / root option — hidden while searching */}
            {!q && (
              <button
                type="button"
                onClick={() => pick("")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-primary-50 ${
                  !value
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-secondary-500 italic"
                }`}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {!value && <CheckIcon className="h-3.5 w-3.5 text-primary-600" />}
                </span>
                {placeholder}
                {!value && (
                  <span className="ml-auto shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                    Đang chọn
                  </span>
                )}
              </button>
            )}

            {/* Tree options */}
            {filtered.map((opt) => {
              const { depth, name } = parseLabelDepth(opt.label);
              const isSelected = opt.value === value;

              return (
                <button
                  key={opt.value}
                  ref={isSelected ? selectedRowRef : undefined}
                  type="button"
                  onClick={() => pick(opt.value)}
                  className={`w-full flex items-center gap-2 py-2 pr-3 text-sm transition-colors ${
                    isSelected
                      ? "bg-primary-50 text-primary-700 font-semibold hover:bg-primary-100"
                      : "text-secondary-800 hover:bg-secondary-50"
                  }`}
                  style={{ paddingLeft: `${10 + depth * 18}px` }}
                >
                  {/* Check / spacer */}
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {isSelected && <CheckIcon className="h-3.5 w-3.5 text-primary-600" />}
                  </span>

                  {/* Tree connector */}
                  {depth > 0 && (
                    <span className="shrink-0 text-[11px] text-secondary-300 select-none leading-none">
                      └
                    </span>
                  )}

                  {/* Folder icon */}
                  {isSelected ? (
                    <FolderOpenIcon className="h-4 w-4 shrink-0 text-primary-500" />
                  ) : (
                    <FolderIcon
                      className={`h-4 w-4 shrink-0 ${
                        depth === 0 ? "text-secondary-500" : "text-secondary-400"
                      }`}
                    />
                  )}

                  <span className="truncate flex-1">{name}</span>

                  {/* "Đang chọn" badge */}
                  {isSelected && (
                    <span className="ml-1 shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                      Đang chọn
                    </span>
                  )}
                </button>
              );
            })}

            {filtered.length === 0 && (
              <p className="px-4 py-5 text-center text-xs text-secondary-400">
                Không tìm thấy danh mục nào
              </p>
            )}
          </div>

          {/* Clear footer */}
          {value && (
            <div className="border-t border-secondary-100 p-1.5">
              <button
                type="button"
                onClick={() => pick("")}
                className="w-full rounded-lg py-1.5 text-xs text-error-500 hover:bg-error-50 hover:text-error-600 transition-colors"
              >
                Xóa — đặt làm danh mục gốc
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
