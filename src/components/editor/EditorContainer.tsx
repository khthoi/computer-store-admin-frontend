"use client";

// ─── EditorContainer ──────────────────────────────────────────────────────────
//
// Thin wrapper that applies the shared visual chrome (border, focus ring,
// error/disabled states) around Toolbar + Content.

interface EditorContainerProps {
  children: React.ReactNode;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
}

export function EditorContainer({
  children,
  hasError,
  disabled,
  className = "",
}: EditorContainerProps) {
  return (
    <div
      className={[
        "ql-editor-wrapper",
        hasError ? "ql-editor-error" : "",
        disabled ? "ql-editor-disabled" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
