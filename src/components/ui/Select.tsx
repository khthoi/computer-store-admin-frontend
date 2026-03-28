"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SelectSize = "sm" | "md" | "lg";

export interface SelectOption {
  /** Unique value stored on selection */
  value: string;
  /** Display text in the list and trigger */
  label: string;
  /** Prevents the option from being selected */
  disabled?: boolean;
}

export interface SelectOptionGroup {
  /** Group header label */
  label: string;
  options: SelectOption[];
}

export type SelectOptions = SelectOption[] | SelectOptionGroup[];

export interface SelectProps {
  /** Flat list or grouped list of options */
  options: SelectOptions;
  /** Selected value (string) or values (string[]) */
  value?: string | string[];
  /** Called with the new selected value or array of values */
  onChange?: (value: string | string[]) => void;
  /** Placeholder text shown when nothing is selected
   * @default "Select…"
   */
  placeholder?: string;
  /** Enable text search to filter options
   * @default false
   */
  searchable?: boolean;
  /** Allow selecting more than one option
   * @default false
   */
  multiple?: boolean;
  /** Show × button to clear the current selection
   * @default false
   */
  clearable?: boolean;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  size?: SelectSize;
  /**
   * Override the dropdown panel width.
   * By default the panel matches the trigger width.
   * Accepts any CSS width value, e.g. "320px", "auto", "min-content".
   */
  dropdownWidth?: string;
  /**
   * Whether to display selected values inside the trigger button.
   * - `true` (default): selected labels / chips are shown in the trigger.
   * - `false`: the trigger always shows the placeholder text. Useful when the
   *   selection is communicated elsewhere (e.g. an active-filter bar).
   */
  showSelectedInTrigger?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  /**
   * Allow the user to create a new option by typing a value with no match.
   * Requires `searchable` to be enabled.
   * When a new option is created it is immediately selectable and visually
   * distinguished with a "Mới" badge in the list.
   * @default false
   */
  creatable?: boolean;
  /**
   * Called when the user confirms creation of a new option.
   * Use this to persist the new value to the server and update `options`.
   */
  onCreateOption?: (label: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isGrouped(opts: SelectOptions): opts is SelectOptionGroup[] {
  return opts.length > 0 && "options" in opts[0];
}

function flatOptions(opts: SelectOptions): SelectOption[] {
  return isGrouped(opts)
    ? opts.flatMap((g) => g.options)
    : (opts as SelectOption[]);
}


// ─── Style maps ───────────────────────────────────────────────────────────────

const TRIGGER_BASE =
  "w-full flex items-center gap-2 rounded border bg-white text-left text-secondary-700 " +
  "cursor-pointer transition-colors duration-150 " +
  "focus:outline-none focus:ring-2 " +
  "disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-400";

const TRIGGER_SIZE: Record<SelectSize, string> = {
  sm: "min-h-8  px-3 py-1   text-sm",
  md: "min-h-10 px-3 py-2   text-sm",
  lg: "min-h-12 px-4 py-2.5 text-base",
};

const TRIGGER_NORMAL =
  "border-secondary-300 hover:border-secondary-400 " +
  "focus:border-primary-500 focus:ring-primary-500/15";
const TRIGGER_ERROR =
  "border-error-400 focus:border-error-500 focus:ring-error-500/15";
const TRIGGER_OPEN =
  "border-primary-500 ring-2 ring-primary-500/15";

// ─── OptionItem sub-component ─────────────────────────────────────────────────

interface OptionItemProps {
  option: SelectOption;
  isSelected: boolean;
  isActive: boolean;
  multiple: boolean;
  onSelect: (o: SelectOption) => void;
  /** True when this option was created locally (shows a "Mới" badge + remove button) */
  isNew?: boolean;
  /** Called when the user clicks × on a locally-created option row */
  onRemoveCreated?: () => void;
}

function OptionItem({
  option,
  isSelected,
  isActive,
  multiple,
  onSelect,
  isNew = false,
  onRemoveCreated,
}: OptionItemProps) {
  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled}
      onClick={() => !option.disabled && onSelect(option)}
      className={[
        "flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-sm outline-none transition-colors",
        isActive
          ? "bg-primary-50 text-primary-700"
          : "text-secondary-700 hover:bg-secondary-50",
        isSelected && !isActive ? "bg-primary-50/60" : "",
        option.disabled ? "pointer-events-none cursor-not-allowed opacity-40" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Multi-select: checkbox indicator */}
      {multiple && (
        <span
          aria-hidden="true"
          className={[
            "flex size-4 shrink-0 items-center justify-center rounded-sm border-2 transition-colors",
            isSelected
              ? "border-primary-600 bg-primary-600"
              : "border-secondary-300 bg-white",
          ].join(" ")}
        >
          {isSelected && (
            <CheckIcon className="size-2.5 text-white" aria-hidden="true" />
          )}
        </span>
      )}
      <span className="flex-1 truncate">{option.label}</span>

      {/* "Mới" badge + optional × for locally-created options */}
      {isNew && (
        <span className="shrink-0 inline-flex items-center gap-1">
          <span className="rounded-full bg-success-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-success-700 border border-success-200">
            Mới
          </span>
          {onRemoveCreated && (
            <button
              type="button"
              aria-label={`Xóa lựa chọn "${option.label}"`}
              onClick={(e) => { e.stopPropagation(); onRemoveCreated(); }}
              className="flex h-4 w-4 items-center justify-center rounded text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
            >
              <XMarkIcon className="size-3" aria-hidden="true" />
            </button>
          )}
        </span>
      )}

      {/* Single select: trailing checkmark */}
      {!multiple && isSelected && (
        <CheckIcon className="size-4 shrink-0 text-primary-600" aria-hidden="true" />
      )}
    </li>
  );
}

// ─── CreateOptionItem sub-component ───────────────────────────────────────────

interface CreateOptionItemProps {
  label: string;
  isActive: boolean;
  onCreate: () => void;
}

function CreateOptionItem({ label, isActive, onCreate }: CreateOptionItemProps) {
  return (
    <li
      role="option"
      aria-selected={false}
      onClick={onCreate}
      className={[
        "flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-sm outline-none transition-colors",
        "border-t border-secondary-100",
        isActive
          ? "bg-primary-50 text-primary-700"
          : "text-primary-600 hover:bg-primary-50",
      ].join(" ")}
    >
      <PlusIcon className="size-4 shrink-0 opacity-70" aria-hidden="true" />
      <span>
        Tạo{" "}
        <span className="font-semibold">&ldquo;{label}&rdquo;</span>
      </span>
    </li>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Select — custom dropdown with search, multi-select, option groups,
 * and optional inline creation of new options.
 *
 * ```tsx
 * // Single select
 * <Select
 *   label="Category"
 *   options={[{ value: "cpu", label: "CPU" }, { value: "gpu", label: "GPU" }]}
 *   value={category}
 *   onChange={(v) => setCategory(v as string)}
 * />
 *
 * // Searchable multi-select with groups
 * <Select
 *   label="Components"
 *   options={[{ label: "Storage", options: [{ value: "ssd", label: "SSD" }] }]}
 *   multiple
 *   searchable
 *   clearable
 *   value={selected}
 *   onChange={(v) => setSelected(v as string[])}
 * />
 *
 * // Creatable single select — user can type a new value and create it inline
 * <Select
 *   label="Brand"
 *   options={brands}
 *   searchable
 *   creatable
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
}: SelectProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const labelId = `${id}-label`;
  const listboxId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(errorMessage);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
    flipUp: boolean;
  } | null>(null);

  // Locally-created options — stored until the parent updates `options` with the real entry
  const [createdOptions, setCreatedOptions] = useState<SelectOption[]>([]);
  // Fast lookup: which values were created locally
  const createdValueSet = new Set(createdOptions.map((o) => o.value));

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Merge prop options with locally-created options for display and lookup
  const allFlat = [...flatOptions(options), ...createdOptions];

  // Normalise value to array for uniform internal handling
  const selectedValues: string[] = multiple
    ? Array.isArray(value) ? value : []
    : value !== undefined && value !== "" ? [value as string] : [];

  const filtered =
    searchable && query
      ? allFlat.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase())
        )
      : allFlat;

  // Rebuild grouped display list from filtered flat (created options have no group)
  const displayOptions: SelectOptions = isGrouped(options)
    ? (options as SelectOptionGroup[])
        .map((g) => ({
          ...g,
          options: g.options.filter((o) =>
            filtered.some((f) => f.value === o.value)
          ),
        }))
        .filter((g) => g.options.length > 0)
    : filtered;

  // For grouped mode: created options aren't in any group — render them separately
  const filteredCreated: SelectOption[] = isGrouped(options)
    ? createdOptions.filter(
        (o) =>
          !searchable ||
          !query ||
          o.label.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // "Create" row: shown when creatable + searchable + typed something + no exact match
  const trimmedQuery = query.trim();
  const exactMatch =
    trimmedQuery !== "" &&
    allFlat.some((o) => o.label.toLowerCase() === trimmedQuery.toLowerCase());
  const showCreateRow = !!(creatable && searchable && trimmedQuery && !exactMatch);

  const triggerLabel = !multiple
    ? allFlat.find((o) => o.value === selectedValues[0])?.label ?? placeholder
    : null;

  // ── Open / close ──────────────────────────────────────────────────────────

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(-1);
    if (searchable) {
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  }, [disabled, searchable]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    triggerRef.current?.focus();
  }, []);

  // ── Position the portal dropdown relative to trigger ──────────────────────
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

    // Initial position
    updatePosition();

    // Update on scroll (any ancestor) and resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  // Close on outside click — must check both container AND portal dropdown
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

  // ── Create new option ──────────────────────────────────────────────────────

  function handleCreate() {
    if (!trimmedQuery) return;
    const newOpt: SelectOption = { value: trimmedQuery, label: trimmedQuery };
    setCreatedOptions((prev) => [...prev, newOpt]);
    onCreateOption?.(trimmedQuery);
    selectOption(newOpt);
    // For multiple: selectOption stays open; clear the search manually
    setQuery("");
    setActiveIndex(-1);
  }

  // ── Remove a locally-created option (deselects + purges from createdOptions) ──

  const handleRemoveCreated = useCallback(
    (value: string) => {
      setCreatedOptions((prev) => prev.filter((o) => o.value !== value));
      if (selectedValues.includes(value)) {
        onChange?.(multiple ? selectedValues.filter((v) => v !== value) : "");
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
    if (e.key === "Escape") {
      closeDropdown();
      return;
    }
    // The navigable list length includes the create row (if shown)
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
          className="mb-1 block text-sm font-medium text-secondary-700"
        >
          {label}
          {required && <span aria-hidden="true" className="ml-0.5 text-error-600">*</span>}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Trigger */}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        removeValue();
                      }}
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
              <span
                className={
                  !showSelectedInTrigger || selectedValues.length === 0
                    ? "text-secondary-400"
                    : ""
                }
              >
                {!showSelectedInTrigger
                  ? placeholder
                  : multiple
                    ? placeholder
                    : triggerLabel}
              </span>
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

        {/* Dropdown panel — rendered via portal to escape overflow/z-index stacking */}
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
                width: dropdownWidth ?? `${dropdownPos.width}px`,
              }}
            >
              {searchable && (
                <div className="border-b border-secondary-100 p-2">
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActiveIndex(-1);
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder={creatable ? "Tìm hoặc tạo mới…" : "Search…"}
                    className="w-full rounded border border-secondary-200 bg-secondary-50 px-2 py-1.5 text-sm placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500/15"
                  />
                </div>
              )}

              <ul role="presentation" className="max-h-60 overflow-auto">
                {/* Empty state — only shown when no options AND no create row */}
                {filtered.length === 0 && filteredCreated.length === 0 && !showCreateRow && (
                  <li className="px-3 py-2 text-sm text-secondary-400">
                    Không tìm thấy kết quả
                  </li>
                )}

                {/* Main options: grouped */}
                {filtered.length > 0 && isGrouped(displayOptions)
                  ? (displayOptions as SelectOptionGroup[]).map((group) => (
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
                              onSelect={selectOption}
                            />
                          ))}
                        </ul>
                      </li>
                    ))
                  : null}

                {/* For grouped mode: render created options below the groups */}
                {filteredCreated.map((opt) => (
                  <OptionItem
                    key={opt.value}
                    option={opt}
                    isSelected={selectedValues.includes(opt.value)}
                    isActive={activeIndex === filtered.indexOf(opt)}
                    multiple={multiple}
                    onSelect={selectOption}
                    isNew
                    onRemoveCreated={() => handleRemoveCreated(opt.value)}
                  />
                ))}

                {/* Main options: flat (includes created options already) */}
                {filtered.length > 0 && !isGrouped(displayOptions)
                  ? (displayOptions as SelectOption[]).map((opt) => (
                      <OptionItem
                        key={opt.value}
                        option={opt}
                        isSelected={selectedValues.includes(opt.value)}
                        isActive={activeIndex === filtered.indexOf(opt)}
                        multiple={multiple}
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

                {/* Create row — always at the bottom, separated by a border */}
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

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name                  Type                         Default          Description
 * ──────────────────────────────────────────────────────────────────────────────
 * options               SelectOptions                required         Flat or grouped option list
 * value                 string | string[]            —                Controlled selected value(s)
 * onChange              (v: string|string[]) => void —                Called on selection change
 * placeholder           string                       "Select…"        Trigger placeholder
 * searchable            boolean                      false            Enable search filtering
 * creatable             boolean                      false            Allow inline option creation (requires searchable)
 * onCreateOption        (label: string) => void      —                Called when user creates a new option
 * multiple              boolean                      false            Multi-select mode
 * clearable             boolean                      false            Show × to clear selection
 * disabled              boolean                      false            Disable the control
 * label                 string                       —                Label above the trigger
 * helperText            string                       —                Hint below; hidden on error
 * errorMessage          string                       —                Validation error message
 * size                  "sm"|"md"|"lg"               "md"             Trigger height
 * dropdownWidth         string                       —                CSS width of the dropdown panel
 * showSelectedInTrigger boolean                      true             Display selected values inside trigger
 * id                    string                       auto             HTML id for label linkage
 * className             string                       ""               Extra classes on trigger
 */
