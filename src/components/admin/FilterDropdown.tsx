"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterOption {
  value: string;
  label: string;
  /** Optional count shown next to the label (e.g. "(12)") */
  count?: number;
}

export interface FilterDropdownProps {
  /** Button label (e.g. "Status", "Brand") */
  label: string;
  options: FilterOption[];
  /** Currently selected values */
  selected: string[];
  /** Called whenever the selection changes */
  onChange: (selected: string[]) => void;
  /**
   * Show a search input inside the dropdown when option list is long.
   * @default false
   */
  searchable?: boolean;
  /**
   * Maximum height of the option list.
   * @default "max-h-60"
   */
  maxHeight?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FilterDropdown — multi-select dropdown for table column filters.
 *
 * ```tsx
 * <FilterDropdown
 *   label="Status"
 *   options={[
 *     { value: "active",   label: "Active",   count: 24 },
 *     { value: "inactive", label: "Inactive", count: 6 },
 *   ]}
 *   selected={statusFilter}
 *   onChange={setStatusFilter}
 *   searchable
 * />
 * ```
 */
export function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  searchable = false,
  maxHeight = "max-h-60",
  className = "",
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<{ top: number; left?: number; right?: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setPosition(null);
  }, []);

  // Calculate dropdown position
  useEffect(() => {
    if (!open || !containerRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const dropdownWidth = Math.max(rect.width, 200);
        const viewportWidth = window.innerWidth;
        const MARGIN = 8;
        const wouldOverflowRight = rect.left + dropdownWidth > viewportWidth - MARGIN;

        if (wouldOverflowRight) {
          setPosition({
            top: rect.bottom + 6,
            right: viewportWidth - rect.right,
            width: dropdownWidth,
          });
        } else {
          setPosition({
            top: rect.bottom + 6,
            left: rect.left,
            width: dropdownWidth,
          });
        }
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(updatePosition);

    // Update position on scroll/resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  // Focus search on open
  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 30);
    }
  }, [open, searchable]);

  const toggle = useCallback(
    (value: string) => {
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      onChange(next);
    },
    [selected, onChange]
  );

  const clearAll = useCallback(() => onChange([]), [onChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") close();
    },
    [close]
  );

  const filtered = query
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  const selectedCount = selected.length;
  const hasSelection = selectedCount > 0;

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={["relative inline-block", className].filter(Boolean).join(" ")}
    >
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
          hasSelection
            ? "border-primary-400 bg-primary-50 text-primary-700"
            : "border-secondary-200 bg-white text-secondary-700 hover:bg-secondary-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        ].join(" ")}
      >
        {label}
        {hasSelection && (
          <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold text-white">
            {selectedCount}
          </span>
        )}
        <ChevronDownIcon
          className={[
            "w-4 h-4 transition-transform duration-150",
            open ? "rotate-180" : "",
            hasSelection ? "text-primary-500" : "text-secondary-400",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown - rendered via portal to escape overflow constraints */}
      {open &&
        position &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] min-w-[200px] rounded-xl border border-secondary-200 bg-white shadow-lg"
            style={{
              top: `${position.top}px`,
              ...(position.right !== undefined
                ? { right: `${position.right}px` }
                : { left: `${position.left}px` }),
              width: `${position.width}px`,
            }}
          >
            {/* Search */}
            {searchable && (
              <div className="border-b border-secondary-100 px-3 py-2">
                <div className="relative">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-400"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="w-full rounded-md border border-secondary-200 py-1.5 pl-7 pr-2 text-xs focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-200"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <ul
              role="listbox"
              aria-multiselectable="true"
              aria-label={`${label} filter options`}
              className={["overflow-y-auto py-1", maxHeight].join(" ")}
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-xs text-secondary-400">
                  No options found
                </li>
              ) : (
                filtered.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(option.value)}
                        className={[
                          "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                          isSelected
                            ? "bg-primary-50 text-primary-700"
                            : "text-secondary-700 hover:bg-secondary-50",
                          "focus-visible:outline-none focus-visible:bg-secondary-50",
                        ].join(" ")}
                      >
                        {/* Checkbox visual */}
                        <span
                          className={[
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                            isSelected
                              ? "border-primary-600 bg-primary-600"
                              : "border-secondary-300 bg-white",
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          {isSelected && (
                            <CheckIcon className="w-2.5 h-2.5 text-white" />
                          )}
                        </span>

                        <span className="flex-1 text-left">{option.label}</span>

                        {option.count !== undefined && (
                          <span className="text-xs text-secondary-400">
                            ({option.count})
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>

            {/* Footer: clear + count */}
            {hasSelection && (
              <div className="flex items-center justify-between border-t border-secondary-100 px-3 py-2">
                <span className="text-xs text-secondary-500">
                  {selectedCount} selected
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1 text-xs text-error-600 hover:underline focus-visible:outline-none"
                >
                  <XMarkIcon className="w-3 h-3" aria-hidden="true" />
                  Clear
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name        Type                        Default    Description
 * ──────────────────────────────────────────────────────────────────────────────
 * label       string                      required   Button label
 * options     FilterOption[]              required   Available filter options
 * selected    string[]                    required   Currently selected values
 * onChange    (selected: string[]) => void required  Selection change callback
 * searchable  boolean                     false      Show search input in dropdown
 * maxHeight   string (Tailwind class)     "max-h-60" Max height of option list
 * className   string                      ""         Extra classes on root wrapper
 */
