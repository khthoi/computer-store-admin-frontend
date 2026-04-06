// ─── Select — Public API re-exports ──────────────────────────────────────────
// All consumers continue to import from "@/src/components/ui/Select" (capital S)
// via the barrel file at ui/Select.tsx — no import paths need to change.

export { Select } from "./Select";
export type {
  SelectProps,
  SelectOption,
  SelectOptionGroup,
  SelectOptions,
  SelectSize,
  SelectOptionBadge,
  SelectOptionBadgeVariant,
} from "./types";
