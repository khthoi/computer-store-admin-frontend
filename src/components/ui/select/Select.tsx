"use client";

// ─── Select — Main component ──────────────────────────────────────────────────

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

import type { SelectProps, SelectOption, SelectOptions } from "./types";
import { isGrouped, flatOptions } from "./utils";
import {
  TRIGGER_BASE,
  TRIGGER_SIZE,
  TRIGGER_NORMAL,
  TRIGGER_ERROR,
  TRIGGER_OPEN,
} from "./styles";
import { OptionItem } from "./OptionItem";
import { CreateOptionItem } from "./CreateOptionItem";

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Select — custom dropdown with search, multi-select, option groups,
 * and optional inline creation of new options.
 *
 * ```tsx
 * // Single select with bold labels and stock badges
 * <Select
 *   label="Product"
 *   boldLabel
 *   options={[
 *     { value: "p1", label: "RTX 4090 FE", description: "SKU: VAR-RTX4090-FE",
 *       badge: { text: "2 left", variant: "warning" } },
 *   ]}
 *   value={selected}
 *   onChange={(v) => setSelected(v as string)}
 *   searchable
 *   clearable
 * />
 *
 * // Searchable multi-select with groups
 * <Select
 *   label="Components"
 *   options={[{ label: "Storage", options: [{ value: "ssd", label: "SSD" }] }]}
 *   multiple searchable clearable
 *   value={selected}
 *   onChange={(v) => setSelected(v as string[])}
 * />
 *
 * // Creatable single select
 * <Select
 *   label="Brand"
 *   options={brands}
 *   searchable creatable
 *   value={brand}
 *   onChange={(v) => setBrand(v as string)}
 *   onCreateOption={(label) => handleCreateBrand(label)}
 * />
 * ```
 */
export function Select({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchable = false,
  multiple = false,
  clearable = false,
  disabled = false,
  label,
  helperText,
  errorMessage,
  size = "md",
  dropdownWidth,
  showSelectedInTrigger = true,
  required,
  id: idProp,
  className = "",
  creatable = false,
  onCreateOption,
  boldLabel = false,
}: SelectProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const labelId  = `${id}-label`;
  const listboxId = `${id}-listbox`;
  const errorId  = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(errorMessage);

  // ── State ─────────────────────────────────────────────────────────────────

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
    flipUp: boolean;
  } | null>(null);

  // Locally-created options (kept until parent updates `options` with the real entry)
  const [createdOptions, setCreatedOptions] = useState<SelectOption[]>([]);
  const createdValueSet = new Set(createdOptions.map((o) => o.value));

  // ── Refs ──────────────────────────────────────────────────────────────────

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef   = useRef<HTMLButtonElement>(null);
  const searchRef    = useRef<HTMLInputElement>(null);
  const dropdownRef  = useRef<HTMLDivElement>(null);

  // ── Derived data ──────────────────────────────────────────────────────────

  const allFlat = [...flatOptions(options), ...createdOptions];

  const selectedValues: string[] = multiple
    ? Array.isArray(value) ? value : []
    : value !== undefined && value !== "" ? [value as string] : [];

  const filtered =
    searchable && query
      ? allFlat.filter(
          (o) =>
            o.label.toLowerCase().includes(query.toLowerCase()) ||
            o.subLabel?.toLowerCase().includes(query.toLowerCase()) ||
            o.description?.toLowerCase().includes(query.toLowerCase())
        )
      : allFlat;

  // Rebuild grouped display list from filtered flat
  const displayOptions: SelectOptions = isGrouped(options)
    ? (options as { label: string; options: SelectOption[] }[])
        .map((g) => ({
          ...g,
          options: g.options.filter((o) =>
            filtered.some((f) => f.value === o.value)
          ),
        }))
        .filter((g) => g.options.length > 0)
    : filtered;

  // Created options that need separate rendering in grouped mode
  const filteredCreated: SelectOption[] = isGrouped(options)
    ? createdOptions.filter(
        (o) =>
          !searchable ||
          !query ||
          o.label.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const trimmedQuery = query.trim();
  const exactMatch =
    trimmedQuery !== "" &&
    allFlat.some((o) => o.label.toLowerCase() === trimmedQuery.toLowerCase());
  const showCreateRow = !!(creatable && searchable && trimmedQuery && !exactMatch);

  const selectedSingleOpt = !multiple
    ? allFlat.find((o) => o.value === selectedValues[0])
    : null;
  const triggerLabel = selectedSingleOpt?.label ?? placeholder;
  const triggerImageUrl = selectedSingleOpt?.imageUrl;

  // ── Open / close ──────────────────────────────────────────────────────────

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(-1);
    if (searchable) setTimeout(() => searchRef.current?.focus(), 10);
  }, [disabled, searchable]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    triggerRef.current?.focus();
  }, []);

  // ── Portal positioning ────────────────────────────────────────────────────

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setDropdownPos(null);
      return;
    }

    function updatePosition() {
      const rect = triggerRef.current!.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const flipUp = spaceBelow < 280 && rect.top > spaceBelow;
      setDropdownPos({
        top: flipUp ? rect.top : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        flipUp,
      });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  // ── Outside-click close ───────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeDropdown]);

  // ── Selection ─────────────────────────────────────────────────────────────

  const selectOption = useCallback(
    (opt: SelectOption) => {
      if (opt.disabled) return;
      if (multiple) {
        const next = selectedValues.includes(opt.value)
          ? selectedValues.filter((v) => v !== opt.value)
          : [...selectedValues, opt.value];
        onChange?.(next);
      } else {
        onChange?.(opt.value);
        closeDropdown();
      }
    },
    [multiple, selectedValues, onChange, closeDropdown]
  );

  const clearAll = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : "");
  };

  // ── Create new option ─────────────────────────────────────────────────────

  function handleCreate() {
    if (!trimmedQuery) return;
    const newOpt: SelectOption = { value: trimmedQuery, label: trimmedQuery };
    setCreatedOptions((prev) => [...prev, newOpt]);
    onCreateOption?.(trimmedQuery);
    selectOption(newOpt);
    setQuery("");
    setActiveIndex(-1);
  }

  // ── Remove locally-created option ────────────────────────────────────────

  const handleRemoveCreated = useCallback(
    (val: string) => {
      setCreatedOptions((prev) => prev.filter((o) => o.value !== val));
      if (selectedValues.includes(val)) {
        onChange?.(multiple ? selectedValues.filter((v) => v !== val) : "");
      }
    },
    [selectedValues, multiple, onChange]
  );

  // ── Keyboard navigation ───────────────────────────────────────────────────

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (["Enter", " ", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      openDropdown();
    }
  };

  const handleDropdownKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") { closeDropdown(); return; }
    const listLength = filtered.length + (showCreateRow ? 1 : 0);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, listLength - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      if (showCreateRow && activeIndex === filtered.length) {
        handleCreate();
      } else {
        const opt = filtered[activeIndex];
        if (opt) selectOption(opt);
      }
    }
  };

  const describedBy =
    [hasError ? errorId : null, !hasError && helperText ? helperId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {label && (
        <label
          id={labelId}
          className="mb-1 block select-none text-sm font-medium text-secondary-700"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 select-none text-error-600">*</span>
          )}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* ── Trigger ──────────────────────────────────────────────────────── */}
        <button
          ref={triggerRef}
          type="button"
          id={id}
          role="combobox"
          aria-labelledby={label ? labelId : undefined}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          onClick={() => (open ? closeDropdown() : openDropdown())}
          onKeyDown={handleTriggerKeyDown}
          className={[
            TRIGGER_BASE,
            TRIGGER_SIZE[size],
            hasError ? TRIGGER_ERROR : open ? TRIGGER_OPEN : TRIGGER_NORMAL,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Value display area */}
          <span className="flex min-w-0 flex-1 flex-wrap gap-1">
            {showSelectedInTrigger && multiple && selectedValues.length > 0 ? (
              selectedValues.map((v) => {
                const opt = allFlat.find((o) => o.value === v);
                if (!opt) return null;

                const removeValue = () => {
                  onChange?.(selectedValues.filter((sv) => sv !== v));
                };

                return (
                  <span
                    key={v}
                    className={[
                      "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium",
                      createdValueSet.has(v)
                        ? "bg-success-100 text-success-700"
                        : "bg-primary-100 text-primary-700",
                    ].join(" ")}
                  >
                    {opt.label}
                    <span
                      role="button"
                      aria-label={`Remove ${opt.label}`}
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); removeValue(); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          removeValue();
                        }
                      }}
                      className="rounded hover:opacity-70 focus:outline-none"
                    >
                      <XMarkIcon className="size-3" aria-hidden="true" />
                    </span>
                  </span>
                );
              })
            ) : (
              <>
                {/* Brand / icon image in single-select trigger */}
                {!multiple && triggerImageUrl && selectedValues.length > 0 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={triggerImageUrl}
                    alt=""
                    className="h-5 w-5 shrink-0 rounded-sm object-contain"
                  />
                )}
                {!showSelectedInTrigger || !selectedSingleOpt ? (
                  <span className="truncate text-secondary-400">{placeholder}</span>
                ) : multiple ? (
                  <span className="truncate text-secondary-400">{placeholder}</span>
                ) : (selectedSingleOpt.subLabel || selectedSingleOpt.description) ? (
                  /* Stacked layout when subLabel or description present */
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate font-semibold text-secondary-900">
                      {selectedSingleOpt.label}
                    </span>
                    {selectedSingleOpt.subLabel && (
                      <span className="truncate text-xs text-secondary-600">
                        {selectedSingleOpt.subLabel}
                      </span>
                    )}
                    {selectedSingleOpt.description && (
                      <span className="truncate font-mono text-xs text-secondary-400">
                        {selectedSingleOpt.description}
                      </span>
                    )}
                  </span>
                ) : (
                  /* Simple single-line for options without sub-info */
                  <span className="truncate">{selectedSingleOpt.label}</span>
                )}
              </>
            )}
          </span>

          {/* Right controls */}
          <span className="flex shrink-0 items-center gap-1 text-secondary-400">
            {clearable && selectedValues.length > 0 && (
              <span
                role="button"
                aria-label="Clear selection"
                tabIndex={0}
                onClick={clearAll}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    clearAll(e);
                  }
                }}
                className="rounded p-0.5 hover:text-secondary-600 focus:outline-none"
              >
                <XMarkIcon className="size-4" aria-hidden="true" />
              </span>
            )}
            <ChevronDownIcon
              className={`size-4 transition-transform duration-150 ${
                open ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </span>
        </button>

        {/* ── Dropdown portal ───────────────────────────────────────────────── */}
        {open &&
          dropdownPos &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={dropdownRef}
              id={listboxId}
              role="listbox"
              aria-multiselectable={multiple}
              aria-label={label}
              tabIndex={-1}
              onKeyDown={handleDropdownKeyDown}
              className="fixed z-[9999] overflow-hidden rounded-md border border-secondary-200 bg-white shadow-lg"
              style={{
                top: dropdownPos.flipUp ? undefined : `${dropdownPos.top}px`,
                bottom: dropdownPos.flipUp
                  ? `${window.innerHeight - dropdownPos.top + 4}px`
                  : undefined,
                left: `${dropdownPos.left}px`,
                // No explicit override → grow freely via minWidth
                // Explicit override → honour hard constraint
                ...(dropdownWidth
                  ? { width: dropdownWidth }
                  : { minWidth: `${dropdownPos.width}px` }),
              }}
            >
              {/* Search input */}
              {searchable && (
                <div className="border-b border-secondary-100 p-2">
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder={creatable ? "Tìm hoặc tạo mới…" : "Search…"}
                    className="w-full rounded border border-secondary-200 bg-secondary-50 px-2 py-1.5 text-sm placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500/15"
                  />
                </div>
              )}

              <ul role="presentation" className="max-h-60 overflow-auto">
                {/* Empty state */}
                {filtered.length === 0 &&
                  filteredCreated.length === 0 &&
                  !showCreateRow && (
                    <li className="px-3 py-2 text-sm text-secondary-400">
                      Không tìm thấy kết quả
                    </li>
                  )}

                {/* Grouped options */}
                {filtered.length > 0 && isGrouped(displayOptions)
                  ? (displayOptions as { label: string; options: SelectOption[] }[]).map(
                      (group) => (
                        <li key={group.label} role="presentation">
                          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-secondary-400">
                            {group.label}
                          </p>
                          <ul>
                            {group.options.map((opt) => (
                              <OptionItem
                                key={opt.value}
                                option={opt}
                                isSelected={selectedValues.includes(opt.value)}
                                isActive={activeIndex === filtered.indexOf(opt)}
                                multiple={multiple}
                                boldLabel={boldLabel}
                                onSelect={selectOption}
                              />
                            ))}
                          </ul>
                        </li>
                      )
                    )
                  : null}

                {/* Created options (grouped mode only) */}
                {filteredCreated.map((opt) => (
                  <OptionItem
                    key={opt.value}
                    option={opt}
                    isSelected={selectedValues.includes(opt.value)}
                    isActive={activeIndex === filtered.indexOf(opt)}
                    multiple={multiple}
                    boldLabel={boldLabel}
                    onSelect={selectOption}
                    isNew
                    onRemoveCreated={() => handleRemoveCreated(opt.value)}
                  />
                ))}

                {/* Flat options */}
                {filtered.length > 0 && !isGrouped(displayOptions)
                  ? (displayOptions as SelectOption[]).map((opt) => (
                      <OptionItem
                        key={opt.value}
                        option={opt}
                        isSelected={selectedValues.includes(opt.value)}
                        isActive={activeIndex === filtered.indexOf(opt)}
                        multiple={multiple}
                        boldLabel={boldLabel}
                        onSelect={selectOption}
                        isNew={createdValueSet.has(opt.value)}
                        onRemoveCreated={
                          createdValueSet.has(opt.value)
                            ? () => handleRemoveCreated(opt.value)
                            : undefined
                        }
                      />
                    ))
                  : null}

                {/* Create row */}
                {showCreateRow && (
                  <CreateOptionItem
                    label={trimmedQuery}
                    isActive={activeIndex === filtered.length}
                    onCreate={handleCreate}
                  />
                )}
              </ul>
            </div>,
            document.body
          )}
      </div>

      {/* Error / helper text */}
      {hasError && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-error-600">
          {errorMessage}
        </p>
      )}
      {!hasError && helperText && (
        <p id={helperId} className="mt-1 text-xs text-secondary-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
