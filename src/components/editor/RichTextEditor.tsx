"use client";

import { useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { BASE_EDITOR_CONFIG } from "@/src/components/editor/config/editorConfig";
import { buildUploadPlugin } from "@/src/components/editor/upload/UploadAdapter";
import { ImageUrlPlugin } from "@/src/components/editor/upload/ImageUrlPlugin";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RichTextEditorProps {
  /**
   * Initial HTML content. CKEditor reads this once on mount.
   * To reset content programmatically, change the `key` prop on the parent
   * to force a full remount.
   */
  value?: string;
  /** Called on every keystroke / format change with the current HTML string. */
  onChange?: (html: string) => void;
  /** Placeholder shown when the editor is empty. */
  placeholder?: string;
  /** Label rendered above the editor. */
  label?: string;
  /** Required field indicator shown next to the label. */
  required?: boolean;
  /** Validation error message shown below the editor. */
  errorMessage?: string;
  /** Helper text shown below the editor when no error is present. */
  helperText?: string;
  /**
   * Minimum content-area height in pixels.
   * @default 220
   */
  minHeight?: number;
  /** Disable all editing interactions. */
  disabled?: boolean;
  /** Extra Tailwind classes applied to the outermost wrapper div. */
  className?: string;
}

// Build the extra plugins once at module level — they have no per-instance config.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EXTRA_PLUGINS: Array<new (editor: any) => any> = [
  buildUploadPlugin(),
  ImageUrlPlugin,
];

// ─── Component ────────────────────────────────────────────────────────────────

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing…",
  label,
  required,
  errorMessage,
  helperText,
  minHeight = 220,
  disabled = false,
  className = "",
}: RichTextEditorProps) {
  // Re-compute only when placeholder changes (uncommon after mount).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = useMemo<Record<string, any>>(
    () => ({
      ...BASE_EDITOR_CONFIG,
      placeholder,
      extraPlugins: EXTRA_PLUGINS,
    }),
    [placeholder]
  );

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-error-500">
              *
            </span>
          )}
        </label>
      )}

      {/* Editor chrome — min-height driven by CSS custom property */}
      <div
        className={[
          "rte-wrapper",
          errorMessage ? "rte-error" : "",
          disabled ? "rte-disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ "--rte-min-height": `${minHeight}px` } as React.CSSProperties}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <CKEditor
          editor={ClassicEditor as any}
          config={config}
          data={value}
          disabled={disabled}
          onChange={(_event: unknown, editor: { getData(): string }) => {
            onChange?.(editor.getData());
          }}
        />
      </div>

      {/* Error / helper text */}
      {errorMessage ? (
        <p className="text-xs text-error-600" role="alert">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p className="text-xs text-secondary-400">{helperText}</p>
      ) : null}
    </div>
  );
}
