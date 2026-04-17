"use client";

import { useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Popover } from "./Popover";
import type { PopoverPlacement } from "./Popover";
import type { ButtonSize } from "./Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DropdownActionVariant = "default" | "success" | "warning" | "danger";

export interface DropdownActionItem {
  key:          string;
  label:        string;
  description?: string;
  icon?:        ReactNode;
  variant?:     DropdownActionVariant;
  disabled?:    boolean;
  onClick:      () => void;
}

export interface DropdownActionProps {
  items:          DropdownActionItem[];
  /** Label shown on the trigger button */
  label?:         ReactNode;
  size?:          ButtonSize;
  placement?:     PopoverPlacement;
  disabled?:      boolean;
  className?:     string;
  /** Called when the dropdown opens or closes */
  onOpenChange?:  (open: boolean) => void;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const ITEM_BASE =
  "w-full flex items-start gap-2.5 px-3 py-2 text-sm transition-colors " +
  "disabled:pointer-events-none disabled:opacity-40 text-left";

const ITEM_VARIANT: Record<DropdownActionVariant, string> = {
  default: "text-secondary-700 hover:bg-secondary-50",
  success: "text-green-700   hover:bg-green-50",
  warning: "text-amber-700   hover:bg-amber-50",
  danger:  "text-error-700   hover:bg-error-50",
};

const ICON_VARIANT: Record<DropdownActionVariant, string> = {
  default: "text-secondary-400",
  success: "text-green-500",
  warning: "text-amber-500",
  danger:  "text-error-500",
};

const TRIGGER_SIZE: Record<ButtonSize, string> = {
  xs: "h-7  px-2.5 text-xs  gap-1",
  sm: "h-8  px-3   text-sm  gap-1.5",
  md: "h-10 px-4   text-sm  gap-2",
  lg: "h-12 px-6   text-base gap-2",
};

const CHEVRON_SIZE: Record<ButtonSize, string> = {
  xs: "w-3   h-3",
  sm: "w-3.5 h-3.5",
  md: "w-4   h-4",
  lg: "w-5   h-5",
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * DropdownAction — a split-purpose action button that reveals a menu of
 * labelled actions on click.
 *
 * ```tsx
 * <DropdownAction
 *   label="Hành động"
 *   size="sm"
 *   placement="bottom-end"
 *   items={[
 *     { key: "approve", label: "Duyệt",    variant: "success", icon: <CheckCircleIcon />, onClick: handleApprove },
 *     { key: "hide",    label: "Ẩn",       variant: "warning", icon: <EyeSlashIcon />,   onClick: handleHide },
 *     { key: "reject",  label: "Từ chối",  variant: "danger",  icon: <XCircleIcon />,    onClick: handleReject },
 *   ]}
 * />
 * ```
 */
export function DropdownAction({
  items,
  label        = "Hành động",
  size         = "sm",
  placement    = "bottom-end",
  disabled     = false,
  className    = "",
  onOpenChange,
}: DropdownActionProps) {
  const [open, setOpen] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  const panel = (
    <ul role="menu" className="min-w-[11rem] overflow-hidden">
      {items.map((item) => (
        <li key={item.key} role="none">
          <button
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              item.onClick();
              handleOpenChange(false);
            }}
            className={[ITEM_BASE, ITEM_VARIANT[item.variant ?? "default"]].join(" ")}
          >
            {item.icon && (
              <span
                className={[
                  "mt-0.5 shrink-0 w-4 h-4 flex items-center justify-center",
                  ICON_VARIANT[item.variant ?? "default"],
                ].join(" ")}
                aria-hidden="true"
              >
                {item.icon}
              </span>
            )}
            <span className="flex flex-col items-start min-w-0">
              <span className="font-medium leading-snug">{item.label}</span>
              {item.description && (
                <span className="text-xs text-secondary-400 leading-snug mt-0.5">
                  {item.description}
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <Popover
      placement={placement}
      open={open}
      onOpenChange={handleOpenChange}
      content={panel}
      panelClassName="overflow-hidden"
    >
      <button
        type="button"
        disabled={disabled}
        className={[
          "inline-flex items-center font-medium rounded transition-all duration-150",
          "border border-secondary-200 bg-white text-secondary-700",
          "hover:bg-secondary-50 hover:border-secondary-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30",
          "disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          TRIGGER_SIZE[size],
          className,
        ].join(" ")}
      >
        {label}
        <ChevronDownIcon
          className={[CHEVRON_SIZE[size], "transition-transform duration-150", open ? "rotate-180" : ""].join(" ")}
          aria-hidden="true"
        />
      </button>
    </Popover>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name       Type                    Default         Description
 * ──────────────────────────────────────────────────────────────────────────────
 * items      DropdownActionItem[]    required        Menu items
 * label      ReactNode               "Hành động"     Trigger button label
 * size       "xs"|"sm"|"md"|"lg"     "sm"            Button size
 * placement  PopoverPlacement        "bottom-end"    Dropdown placement
 * disabled   boolean                 false           Disables the trigger
 * className  string                  ""              Extra classes on trigger
 *
 * DropdownActionItem:
 *   key          string                    Unique key
 *   label        string                    Item label
 *   description  string?                   Sub-label (muted, below label)
 *   icon         ReactNode?                Leading icon (16×16)
 *   variant      "default"|"success"|      Colour style
 *                "warning"|"danger"
 *   disabled     boolean?                  Disables this item only
 *   onClick      () => void                Click handler
 */
