"use client";

import "@/src/components/editor/styles/editor.css";
import { useQuillEditor } from "@/src/components/editor/hooks/useQuillEditor";

// ─── SpecificationItemEditor ──────────────────────────────────────────────────
//
// Lightweight Quill wrapper restricted to: Bold, Italic, Bullet list, Clean.
// Used on the variant edit page (not the detail page).

interface SpecificationItemEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function SpecificationItemEditor({
  value,
  onChange,
  placeholder = "Enter specification value…",
}: SpecificationItemEditorProps) {
  const { toolbarRef, editorRef } = useQuillEditor({
    value,
    controlledValue: value,
    placeholder,
    onChange,
  });

  return (
    <div className="ql-editor-wrapper">
      {/* Minimal toolbar — Bold, Italic, Bullet list, Clean only */}
      <div ref={toolbarRef} id="ql-spec-toolbar">
        <span className="ql-formats">
          <button type="button" className="ql-bold" />
          <button type="button" className="ql-italic" />
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-list" value="bullet" />
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-clean" />
        </span>
      </div>

      {/* Content area */}
      <div
        ref={editorRef}
        style={{ minHeight: "80px", maxHeight: "200px", overflowY: "auto" }}
      />
    </div>
  );
}
