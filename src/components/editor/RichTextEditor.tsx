"use client";

import "@/src/components/editor/styles/editor.css";
import { useState, useEffect, useCallback } from "react";
import { EditorContainer } from "@/src/components/editor/EditorContainer";
import { EditorToolbar } from "@/src/components/editor/EditorToolbar";
import { EditorContent } from "@/src/components/editor/EditorContent";
import { VideoEmbedModal } from "@/src/components/editor/modules/VideoEmbedModal";
import { useQuillEditor } from "@/src/components/editor/hooks/useQuillEditor";
import type { UploadFn } from "@/src/components/editor/modules/ImageHandler";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RichTextEditorProps {
  /** Current HTML value (controlled). */
  value?: string;
  /** Default HTML value (uncontrolled — read once on mount). */
  defaultValue?: string;
  /** Called on every change with the current HTML string. */
  onChange?: (html: string) => void;
  /** Placeholder shown when the editor is empty. */
  placeholder?: string;
  /** Label rendered above the editor (optional). */
  label?: string;
  /** Required field indicator. */
  required?: boolean;
  /** Error message shown below the editor. */
  errorMessage?: string;
  /** Helper text shown below the editor (when no error). */
  helperText?: string;
  /** Minimum height of the content area in pixels. */
  minHeight?: number;
  /** Maximum height of the content area in pixels. */
  maxHeight?: number;
  /** Max character count — counter turns red if exceeded. */
  maxLength?: number;
  /** Disable all editing. */
  disabled?: boolean;
  /** Show word/character count. */
  showCount?: boolean;
  /** Optional async upload function for images. */
  uploadFn?: UploadFn;
  /** Additional class name for the outer wrapper. */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RichTextEditor({
  value,
  defaultValue,
  onChange,
  placeholder = "Start writing…",
  label,
  required,
  errorMessage,
  helperText,
  minHeight = 220,
  maxHeight,
  maxLength,
  disabled = false,
  showCount = false,
  uploadFn,
  className = "",
}: RichTextEditorProps) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [charDisplay, setCharDisplay] = useState(0);

  const handleChange = useCallback(
    (html: string) => {
      onChange?.(html);
    },
    [onChange]
  );

  const {
    toolbarRef,
    editorRef,
    insertVideo,
    insertDivider,
    charCount,
  } = useQuillEditor({
    value: defaultValue ?? value,
    controlledValue: value,
    placeholder,
    readOnly: disabled,
    maxLength,
    onChange: (html) => {
      setCharDisplay(charCount.current);
      handleChange(html);
    },
    uploadFn,
  });

  // Sync initial char count after mount
  useEffect(() => {
    setCharDisplay(charCount.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleVideoConfirm(url: string) {
    setVideoModalOpen(false);
    insertVideo(url);
  }

  // ── Char count display ────────────────────────────────────────────────────

  const isOverLimit = maxLength !== undefined && charDisplay > maxLength;
  const countClass = isOverLimit
    ? "ql-char-count-error"
    : maxLength !== undefined && charDisplay >= maxLength * 0.9
    ? "ql-char-count-warning"
    : "";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="ml-0.5 text-error-500">*</span>}
        </label>
      )}

      {/* Editor chrome */}
      <EditorContainer hasError={!!errorMessage} disabled={disabled}>
        {/* Toolbar */}
        <EditorToolbar
          ref={toolbarRef}
          onInsertDivider={insertDivider}
          onInsertVideo={() => setVideoModalOpen(true)}
          disabled={disabled}
        />

        {/* Content area */}
        <EditorContent
          ref={editorRef}
          minHeight={minHeight}
          maxHeight={maxHeight}
        />

        {/* Character count bar */}
        {showCount && (
          <div className={`ql-char-count ${countClass}`}>
            {maxLength !== undefined ? (
              <span>
                {charDisplay.toLocaleString()} / {maxLength.toLocaleString()}
              </span>
            ) : (
              <span>{charDisplay.toLocaleString()} characters</span>
            )}
          </div>
        )}
      </EditorContainer>

      {/* Error / helper text */}
      {errorMessage ? (
        <p className="text-xs text-error-600">{errorMessage}</p>
      ) : helperText ? (
        <p className="text-xs text-secondary-400">{helperText}</p>
      ) : null}

      {/* Video embed modal */}
      <VideoEmbedModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        onConfirm={handleVideoConfirm}
      />
    </div>
  );
}
