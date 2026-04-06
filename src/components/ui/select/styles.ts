// ─── Select — Static style constants ─────────────────────────────────────────

import type { SelectSize } from "./types";

export const TRIGGER_BASE =
  "w-full flex items-center gap-2 rounded border bg-white text-left text-secondary-700 " +
  "cursor-pointer transition-colors duration-150 " +
  "focus:outline-none focus:ring-2 " +
  "disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-400";

export const TRIGGER_SIZE: Record<SelectSize, string> = {
  sm: "min-h-8  px-3 py-1   text-sm",
  md: "min-h-10 px-3 py-2   text-sm",
  lg: "min-h-12 px-4 py-2.5 text-base",
};

export const TRIGGER_NORMAL =
  "border-secondary-300 hover:border-secondary-400 " +
  "focus:border-primary-500 focus:ring-primary-500/15";

export const TRIGGER_ERROR =
  "border-error-400 focus:border-error-500 focus:ring-error-500/15";

export const TRIGGER_OPEN =
  "border-primary-500 ring-2 ring-primary-500/15";
