"use client";

import { forwardRef } from "react";

// ─── EditorContent ────────────────────────────────────────────────────────────
//
// The DOM node that Quill mounts its content-editable area into.
// Rendered as a <div>; Quill converts it to a `contenteditable` div internally.

interface EditorContentProps {
  minHeight?: number | string;
  maxHeight?: number | string;
  className?: string;
}

export const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
  function EditorContent({ minHeight = 200, maxHeight, className = "" }, ref) {
    const style: React.CSSProperties = {
      minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
      ...(maxHeight
        ? {
            maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
            overflowY: "auto",
          }
        : {}),
    };

    return (
      <div
        ref={ref}
        style={style}
        className={className}
        // Quill overrides these with its own attributes; placeholders for TS
        suppressContentEditableWarning
      />
    );
  }
);
