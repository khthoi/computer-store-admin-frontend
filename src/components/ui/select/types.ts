// ─── Select — Type definitions ────────────────────────────────────────────────

export type SelectSize = "sm" | "md" | "lg";

/** Colour variants for the per-option badge. */
export type SelectOptionBadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info";

/**
 * A small badge rendered at the top-right of an option row.
 * Pass a plain string for the default (grey) style,
 * or an object to choose a colour variant.
 *
 * @example
 * { text: "42 in stock", variant: "success" }
 * { text: "2 left",      variant: "warning" }
 * { text: "Out of stock", variant: "error"  }
 */
export type SelectOptionBadge =
  | string
  | { text: string; variant?: SelectOptionBadgeVariant };

export interface SelectOption {
  /** Unique value stored on selection */
  value: string;
  /** Display text in the list and trigger */
  label: string;
  /**
   * Optional secondary text shown below the label in the dropdown list
   * (e.g. SKU, product ID). Rendered in font-mono, grey.
   */
  description?: string;
  /**
   * Optional badge shown at the top-right corner of the option row.
   * Useful for contextual info like stock counts, statuses, or counts.
   * Pass a plain string for grey style, or `{ text, variant }` for colour.
   */
  badge?: SelectOptionBadge;
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
  /**
   * Placeholder text shown when nothing is selected.
   * @default "Select…"
   */
  placeholder?: string;
  /**
   * Enable text search to filter options.
   * Search matches against both `label` and `description`.
   * @default false
   */
  searchable?: boolean;
  /**
   * Allow selecting more than one option.
   * @default false
   */
  multiple?: boolean;
  /**
   * Show × button to clear the current selection.
   * @default false
   */
  clearable?: boolean;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  size?: SelectSize;
  /**
   * Override the dropdown panel to a fixed CSS width.
   * By default the panel uses `minWidth` equal to the trigger width so it can
   * grow naturally to fit long labels, descriptions, and badges.
   * Only set this when you need to enforce a hard constraint,
   * e.g. "280px" in a narrow sidebar panel.
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
  /**
   * When `true`, each option's label text is rendered in font-semibold inside
   * the dropdown list. Does not affect the description line or trigger chips.
   * @default false
   */
  boldLabel?: boolean;
}
