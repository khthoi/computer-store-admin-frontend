"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { CheckIcon, EyeDropperIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

// ─── Default preset palette ────────────────────────────────────────────────────

const DEFAULT_PRESETS: string[] = [
  // Warm / Alert
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  // Cool / Positive
  "#22c55e", "#14b8a6", "#3b82f6", "#6366f1",
  // Vivid / Fashion
  "#8b5cf6", "#ec4899", "#e11d48", "#d97706",
  // Neutral / Dark
  "#6b7280", "#374151", "#1f2937", "#000000",
  // Light / Pastel
  "#ffffff", "#fef9c3", "#dbeafe", "#fce7f3",
];

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ColorSelectProps {
  /** Hex color value — must be `"#rrggbb"` format */
  value?: string;
  /** Called with the new hex string whenever color changes */
  onChange?: (color: string) => void;
  /** Visible label rendered above the control */
  label?: string;
  /** Hint shown below; hidden when errorMessage is set */
  helperText?: string;
  /** Validation error — red border + message */
  errorMessage?: string;
  /**
   * Preset color swatches shown below the hex input.
   * Pass an empty array to hide the preset grid.
   */
  presets?: string[];
  /**
   * Optional text to render inside a live preview badge so the user
   * can see how their badge will look (background + auto contrast text).
   */
  previewText?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isValidHex(v: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

function normalizeHex(v: string): string {
  const trimmed = v.trim();
  if (trimmed.startsWith("#")) return trimmed;
  return `#${trimmed}`;
}

/** WCAG relative luminance */
function getLuminance(hex: string): number {
  if (!isValidHex(hex)) return 0;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Returns the text color (#000 or #fff) that maximises contrast on `hex` */
function contrastColor(hex: string): "#000000" | "#ffffff" {
  return getLuminance(hex) > 0.179 ? "#000000" : "#ffffff";
}

// ─── ColorSelect ───────────────────────────────────────────────────────────────

export function ColorSelect({
  value = "#ef4444",
  onChange,
  label,
  helperText,
  errorMessage,
  presets = DEFAULT_PRESETS,
  previewText,
  disabled = false,
  required,
  id: idProp,
  className = "",
}: ColorSelectProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const nativeRef = useRef<HTMLInputElement>(null);
  const hexInputRef = useRef<HTMLInputElement>(null);

  const hasError = Boolean(errorMessage);
  const safeValue = isValidHex(value) ? value : "#ef4444";

  // Sync the hex text input when the external `value` prop changes
  useEffect(() => {
    if (hexInputRef.current && document.activeElement !== hexInputRef.current) {
      hexInputRef.current.value = value ?? "#ef4444";
    }
  }, [value]);

  const commit = useCallback(
    (raw: string) => {
      const hex = normalizeHex(raw);
      if (isValidHex(hex)) {
        onChange?.(hex);
        if (hexInputRef.current && document.activeElement !== hexInputRef.current) {
          hexInputRef.current.value = hex;
        }
      }
    },
    [onChange],
  );

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    commit(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeHex(e.target.value);
    if (isValidHex(normalized)) commit(normalized);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const normalized = normalizeHex(e.target.value);
    if (!isValidHex(normalized)) {
      e.target.value = safeValue;
    } else {
      e.target.value = normalized.toLowerCase();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const normalized = normalizeHex((e.target as HTMLInputElement).value);
      if (isValidHex(normalized)) commit(normalized);
    }
  };

  const handleSwatchClick = () => {
    if (!disabled) nativeRef.current?.click();
  };

  const inputBorderCls = hasError
    ? "border-error-400 focus:border-error-500 focus:ring-error-500/15"
    : "border-secondary-200 focus:border-primary-400 focus:ring-primary-400/15";

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block select-none text-sm font-medium text-secondary-700"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 select-none text-error-600">*</span>
          )}
        </label>
      )}

      {/* ── Main control row ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Swatch button — opens native color picker */}
        <button
          type="button"
          onClick={handleSwatchClick}
          disabled={disabled}
          title="Click để mở bảng chọn màu"
          aria-label={`Màu hiện tại: ${safeValue}. Click để mở bảng chọn màu`}
          className={[
            "group relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:scale-105 hover:shadow-md",
            safeValue === "#ffffff" ? "border-secondary-300" : "border-transparent",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ backgroundColor: safeValue }}
        >
          {/* Eyedropper icon — shown on hover */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <EyeDropperIcon
              className="h-4 w-4 drop-shadow"
              style={{ color: contrastColor(safeValue) }}
              aria-hidden
            />
          </span>
          {/* Hidden native color input */}
          <input
            ref={nativeRef}
            type="color"
            value={safeValue}
            onChange={handleNativeChange}
            disabled={disabled}
            tabIndex={-1}
            aria-hidden
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </button>

        {/* Hex text input */}
        <div className="relative flex-1">
          <input
            ref={hexInputRef}
            id={id}
            type="text"
            defaultValue={value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            disabled={disabled}
            maxLength={7}
            placeholder="#000000"
            spellCheck={false}
            autoComplete="off"
            className={[
              "w-full rounded-lg border px-3 py-2 text-sm font-mono transition-colors duration-150",
              "focus:outline-none focus:ring-2",
              "disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:text-secondary-400",
              inputBorderCls,
            ]
              .filter(Boolean)
              .join(" ")}
          />
          {hasError && (
            <ExclamationCircleIcon
              className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-error-500"
              aria-hidden
            />
          )}
        </div>

        {/* Live preview badge */}
        {previewText && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm"
            style={{
              backgroundColor: safeValue,
              color: contrastColor(safeValue),
            }}
            aria-label={`Preview: ${previewText}`}
          >
            {previewText}
          </span>
        )}
      </div>

      {/* ── Preset palette grid ──────────────────────────────────────── */}
      {presets.length > 0 && (
        <div
          className="mt-2.5 flex flex-wrap gap-1.5"
          role="group"
          aria-label="Màu nhanh"
        >
          {presets.map((preset) => {
            const isSelected = safeValue.toLowerCase() === preset.toLowerCase();
            const isWhite = preset === "#ffffff";
            return (
              <button
                key={preset}
                type="button"
                disabled={disabled}
                onClick={() => commit(preset)}
                title={preset}
                aria-label={`Chọn màu ${preset}`}
                aria-pressed={isSelected}
                className={[
                  "relative h-7 w-7 rounded-md border-2 transition-all duration-100",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  isSelected
                    ? "scale-110 border-primary-500 shadow-md"
                    : isWhite
                      ? "border-secondary-200 hover:border-secondary-400 hover:scale-110"
                      : "border-transparent hover:scale-110 hover:shadow-sm hover:border-secondary-300",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ backgroundColor: preset }}
              >
                {isSelected && (
                  <CheckIcon
                    className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 drop-shadow"
                    style={{ color: contrastColor(preset) }}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Helper / Error text ──────────────────────────────────────── */}
      {hasError && (
        <p role="alert" className="mt-1.5 text-xs text-error-600">
          {errorMessage}
        </p>
      )}
      {!hasError && helperText && (
        <p className="mt-1.5 text-xs text-secondary-500">{helperText}</p>
      )}
    </div>
  );
}
