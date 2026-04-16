// ─── Select — OptionItem sub-component ───────────────────────────────────────

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { SelectOption } from "./types";
import { resolveBadge, BADGE_VARIANT_CLASSES } from "./utils";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface OptionItemProps {
  option: SelectOption;
  isSelected: boolean;
  isActive: boolean;
  multiple: boolean;
  boldLabel: boolean;
  onSelect: (o: SelectOption) => void;
  /** True when this option was created locally (shows a "Mới" badge + remove button). */
  isNew?: boolean;
  /** Called when the user clicks × on a locally-created option row. */
  onRemoveCreated?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OptionItem({
  option,
  isSelected,
  isActive,
  multiple,
  boldLabel,
  onSelect,
  isNew = false,
  onRemoveCreated,
}: OptionItemProps) {
  const resolvedBadge = option.badge ? resolveBadge(option.badge) : null;

  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled}
      onClick={() => !option.disabled && onSelect(option)}
      className={[
        // items-start so badge + description stay pinned to top;
        // checkbox gets mt-0.5 below to stay visually centred on single-line rows
        "flex cursor-pointer select-none items-start gap-2 px-3 py-2 text-sm outline-none transition-colors",
        isActive
          ? "bg-primary-50 text-primary-700"
          : "text-secondary-700 hover:bg-secondary-50",
        isSelected && !isActive ? "bg-primary-50/60" : "",
        option.disabled ? "pointer-events-none cursor-not-allowed opacity-40" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Brand / icon image */}
      {option.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={option.imageUrl}
          alt=""
          className="mt-0.5 h-6 w-6 shrink-0 rounded-sm object-contain"
        />
      )}

      {/* Multi-select: checkbox */}
      {multiple && (
        <span
          aria-hidden="true"
          className={[
            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border-2 transition-colors",
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

      {/* Label + description */}
      <span className="flex-1 min-w-0 pt-px">
        <span
          className={[
            "block truncate",
            boldLabel ? "font-semibold" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {option.label}
        </span>
        {option.description && (
          <span className="block truncate text-xs text-secondary-400 font-mono mt-0.5">
            {option.description}
          </span>
        )}
      </span>

      {/* Right column: badge (top) → Mới / checkmark (below) */}
      <span className="shrink-0 flex flex-col items-end gap-1">
        {/* Per-option info badge */}
        {resolvedBadge && (
          <span
            className={[
              "inline-block rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none whitespace-nowrap",
              BADGE_VARIANT_CLASSES[resolvedBadge.variant],
            ].join(" ")}
          >
            {resolvedBadge.text}
          </span>
        )}

        {/* "Mới" badge + optional × for locally-created options */}
        {isNew && (
          <span className="inline-flex items-center gap-1">
            <span className="rounded-full bg-success-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-success-700 border border-success-200">
              Mới
            </span>
            {onRemoveCreated && (
              <button
                type="button"
                aria-label={`Xóa lựa chọn "${option.label}"`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCreated();
                }}
                className="flex h-4 w-4 items-center justify-center rounded text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
              >
                <XMarkIcon className="size-3" aria-hidden="true" />
              </button>
            )}
          </span>
        )}

        {/* Single select: trailing checkmark */}
        {!multiple && isSelected && (
          <CheckIcon
            className="size-4 text-primary-600 mt-px"
            aria-hidden="true"
          />
        )}
      </span>
    </li>
  );
}
