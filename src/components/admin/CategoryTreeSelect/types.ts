// ─── CategoryTreeSelect — shared types ───────────────────────────────────────

export interface CategoryNode {
  id: string;
  label: string;
  children?: CategoryNode[];
}

export interface CategoryTreeSelectProps {
  /** Tree-structured category data */
  categories: CategoryNode[];
  /** Currently selected category id */
  value?: string;
  /** Called with the selected node id and full node when the user makes a selection */
  onChange: (id: string, node: CategoryNode) => void;
  /** Placeholder shown on the trigger when nothing is selected */
  placeholder?: string;
  /** Label rendered above the trigger */
  label?: string;
  /** Required field indicator */
  required?: boolean;
  /** Error message shown below the trigger */
  errorMessage?: string;
  /** Helper text shown below when no error */
  helperText?: string;
  /** Whether parent (non-leaf) nodes can be selected. Default: true */
  selectableParents?: boolean;
  /** Disable the entire component */
  disabled?: boolean;
  /** Additional className for the outer wrapper */
  className?: string;
}
