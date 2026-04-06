// ─── Select — Barrel re-export ────────────────────────────────────────────────
// Implementation lives in ./select/ (split into types, utils, styles,
// OptionItem, CreateOptionItem, and the main Select component).
// This file keeps the original import path intact for all consumers:
//   import { Select } from "@/src/components/ui/Select"
// ─────────────────────────────────────────────────────────────────────────────

export {
  Select,
  type SelectProps,
  type SelectOption,
  type SelectOptionGroup,
  type SelectOptions,
  type SelectSize,
  type SelectOptionBadge,
  type SelectOptionBadgeVariant,
} from "./select/index";
