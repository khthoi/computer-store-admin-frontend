"use client";

import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Size variant for the Textarea */
export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label rendered above the textarea */
  label?: string;
  /** Supplementary text rendered below the textarea. Hidden when errorMessage is set. */
  helperText?: string;
  /** Validation error message. Sets aria-invalid and red border. */
  errorMessage?: string;
  /** Height / text size variant
   * @default "md"
   */
  size?: TextareaSize;
  /**
   * Automatically grows the textarea to fit its content.
   * Removes the manual resize handle.
   * @default false
   */
  autoResize?: boolean;
  /**
   * Shows a live "current / max" character counter below the textarea.
   * Requires either `maxLength` or `maxCount` to be provided.
   * @default false
   */
  showCharCount?: boolean;
  /**
   * Maximum number shown in the character counter.
   * Falls back to `maxLength` when omitted.
   */
  maxCount?: number;
  /**
   * Shows a live "X / max words" counter below the textarea.
   * @default false
   */
  showWordCount?: boolean;
  /**
   * Hard word limit. When set, input that would exceed this count is
   * truncated to exactly `maxWordCount` words on every change.
   */
  maxWordCount?: number;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const TEXTAREA_BASE =
  "w-full rounded border bg-white text-secondary-700 " +
  "placeholder:text-secondary-400 " +
  "transition-colors duration-150 " +
  "focus:outline-none focus:ring-2 " +
  "disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-400";

const SIZE: Record<TextareaSize, string> = {
  sm: "px-3 py-2   text-sm  min-h-[80px]",
  md: "px-3 py-2.5 text-sm  min-h-[100px]",
  lg: "px-4 py-3   text-base min-h-[120px]",
};

const STATE_NORMAL =
  "border-secondary-300 " +
  "focus:border-primary-500 focus:ring-primary-500/15";

const STATE_ERROR =
  "border-error-400 " +
  "focus:border-error-500 focus:ring-error-500/15";

// ─── Word count helper ────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

/** Truncate `text` to at most `max` words, preserving trailing whitespace. */
function truncateToWords(text: string, max: number): string {
  if (text.trim() === "") return text;
  // Split preserving whitespace tokens so we can rejoin cleanly
  const parts = text.split(/(\s+)/);
  let wordsSeen = 0;
  let result = "";
  for (const part of parts) {
    if (/\S/.test(part)) {
      if (wordsSeen >= max) break;
      wordsSeen++;
    }
    result += part;
  }
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Textarea — multi-line text input with auto-resize, character count,
 * label, helper text, and validation.
 *
 * ```tsx
 * // Controlled with auto-resize
 * <Textarea
 *   label="Product description"
 *   value={description}
 *   onChange={e => setDescription(e.target.value)}
 *   autoResize
 * />
 *
 * // With character counter (soft limit shown, hard limit enforced)
 * <Textarea
 *   label="Short bio"
 *   maxLength={200}
 *   showCharCount
 *   helperText="Keep it brief."
 * />
 *
 * // With validation error
 * <Textarea
 *   label="Return reason"
 *   errorMessage="Please describe the issue (min. 20 characters)."
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      helperText,
      errorMessage,
      size = "md",
      autoResize = false,
      showCharCount = false,
      maxCount,
      showWordCount = false,
      maxWordCount,
      id: idProp,
      onChange,
      value,
      defaultValue,
      maxLength,
      className = "",
      required,
      ...rest
    },
    forwardedRef
  ) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const hasError = Boolean(errorMessage);

    // Resolve the display limit: prefer explicit maxCount, fall back to maxLength
    const displayLimit = maxCount ?? maxLength;

    // For controlled inputs, derive current length from value prop
    const currentLength = value !== undefined ? String(value).length : undefined;

    // Word count (controlled only; uncontrolled falls back to 0)
    const currentWordCount = value !== undefined ? countWords(String(value)) : 0;
    const wordCountAtLimit =
      maxWordCount !== undefined && currentWordCount >= maxWordCount;

    const describedBy = [
      hasError ? errorId : null,
      !hasError && helperText ? helperId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    // ── Change handler — enforces word limit, drives auto-resize ─────────────
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        let newValue = e.target.value;

        // Hard word-limit enforcement
        if (maxWordCount !== undefined && countWords(newValue) > maxWordCount) {
          newValue = truncateToWords(newValue, maxWordCount);
          // Sync the DOM element to the truncated value
          if (innerRef.current) {
            innerRef.current.value = newValue;
          }
          // Re-synthesise the event with the truncated value so consumers stay in sync
          Object.defineProperty(e, "target", {
            writable: false,
            value: { ...e.target, value: newValue },
          });
        }

        if (autoResize && innerRef.current) {
          innerRef.current.style.height = "auto";
          innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
        }
        onChange?.(e);
      },
      [autoResize, maxWordCount, onChange]
    );

    // ── Merge forwarded ref + inner ref ───────────────────────────────────────
    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (
            forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>
          ).current = node;
        }
      },
      [forwardedRef]
    );

    // ── Counter colors ────────────────────────────────────────────────────────
    const isAtLimit =
      displayLimit !== undefined &&
      currentLength !== undefined &&
      currentLength >= displayLimit;

    const counterClass = isAtLimit
      ? "text-error-600 font-medium"
      : "text-secondary-400";

    const wordCounterClass = wordCountAtLimit
      ? "text-error-600 font-medium"
      : "text-secondary-400";

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className="mb-1 block text-sm font-medium text-secondary-700"
          >
            {label}
            {required && <span aria-hidden="true" className="ml-0.5 text-error-600">*</span>}
          </label>
        )}

        <textarea
          ref={setRef}
          id={id}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          onChange={handleChange}
          className={[
            TEXTAREA_BASE,
            SIZE[size],
            hasError ? STATE_ERROR : STATE_NORMAL,
            autoResize ? "resize-none overflow-hidden" : "resize-y",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />

        {/* Bottom row: error/helper on the left, char count on the right */}
        <div className="mt-1 flex items-start justify-between gap-2">
          <div className="min-w-0">
            {hasError && (
              <p id={errorId} role="alert" className="text-xs text-error-600">
                {errorMessage}
              </p>
            )}
            {!hasError && helperText && (
              <p id={helperId} className="text-xs text-secondary-500">
                {helperText}
              </p>
            )}
          </div>

          {showWordCount && maxWordCount !== undefined && (
            <p
              aria-live="polite"
              aria-atomic="true"
              className={`shrink-0 tabular-nums text-xs ${wordCounterClass}`}
            >
              {currentWordCount} / {maxWordCount} từ
            </p>
          )}
          {!showWordCount && showCharCount && displayLimit !== undefined && (
            <p
              aria-live="polite"
              aria-atomic="true"
              className={`shrink-0 tabular-nums text-xs ${counterClass}`}
            >
              {currentLength ?? 0}/{displayLimit}
            </p>
          )}
        </div>
      </div>
    );
  }
);

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name          Type               Default   Description
 * ──────────────────────────────────────────────────────────────────────────────
 * label         string             —         Visible label above the textarea
 * helperText    string             —         Hint text below; hidden when errorMessage set
 * errorMessage  string             —         Validation error; sets aria-invalid + red border
 * size          "sm"|"md"|"lg"     "md"      Height + text size variant
 * autoResize    boolean            false     Grows height to fit content; removes resize handle
 * showCharCount boolean            false     Shows "n / max" counter; needs maxLength or maxCount
 * maxCount      number             —         Display limit for counter (overrides maxLength display)
 * maxLength     number             —         Native max characters (enforced by browser)
 * id            string             auto      HTML id; auto-generated if omitted
 * disabled      boolean            false     Native disabled state
 * placeholder   string             —         Placeholder text
 * value         string             —         Controlled value
 * defaultValue  string             —         Uncontrolled default
 * onChange      ChangeEventHandler —         Controlled change handler
 * rows          number             —         Initial visible rows (overrides min-height)
 * className     string             ""        Extra Tailwind classes on <textarea>
 *
 * All native <textarea> HTML attributes are also supported via spread.
 */
