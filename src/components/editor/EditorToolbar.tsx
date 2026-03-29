"use client";

import { forwardRef } from "react";
import { MinusIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

// ─── EditorToolbar ────────────────────────────────────────────────────────────
//
// Renders the Quill toolbar container.  Quill reads the data-* attributes on
// `.ql-formats` children to auto-create its standard buttons.
//
// Custom actions (Divider, Video) are plain <button>s placed after the
// auto-generated Quill buttons; they call back into the editor hook.

interface EditorToolbarProps {
  onInsertDivider?: () => void;
  onInsertVideo?: () => void;
  disabled?: boolean;
}

export const EditorToolbar = forwardRef<HTMLDivElement, EditorToolbarProps>(
  function EditorToolbar({ onInsertDivider, onInsertVideo, disabled }, ref) {
    return (
      <div
        id="ql-toolbar-container"
        ref={ref}
        className={disabled ? "pointer-events-none opacity-50" : ""}
      >
        {/* ── Heading ── */}
        <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="1">H1</option>
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="">Normal</option>
          </select>
        </span>

        {/* ── Inline formatting ── */}
        <span className="ql-formats">
          <button type="button" className="ql-bold" />
          <button type="button" className="ql-italic" />
          <button type="button" className="ql-underline" />
          <button type="button" className="ql-strike" />
        </span>

        {/* ── Colour ── */}
        <span className="ql-formats">
          <select className="ql-color" />
          <select className="ql-background" />
        </span>

        {/* ── Lists ── */}
        <span className="ql-formats">
          <button type="button" className="ql-list" value="ordered" />
          <button type="button" className="ql-list" value="bullet" />
        </span>

        {/* ── Indent ── */}
        <span className="ql-formats">
          <button type="button" className="ql-indent" value="-1" />
          <button type="button" className="ql-indent" value="+1" />
        </span>

        {/* ── Alignment ── */}
        <span className="ql-formats">
          <select className="ql-align" />
        </span>

        {/* ── Code / quote ── */}
        <span className="ql-formats">
          <button type="button" className="ql-code" />
          <button type="button" className="ql-code-block" />
          <button type="button" className="ql-blockquote" />
        </span>

        {/* ── Media ── */}
        <span className="ql-formats">
          <button type="button" className="ql-link" />
          <button type="button" className="ql-image" />
        </span>

        {/* ── Custom: Divider ── */}
        {onInsertDivider && (
          <span className="ql-formats">
            <button
              type="button"
              title="Insert divider"
              aria-label="Insert horizontal divider"
              onClick={onInsertDivider}
              className="ql-custom-btn"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
          </span>
        )}

        {/* ── Custom: Video embed ── */}
        {onInsertVideo && (
          <span className="ql-formats">
            <button
              type="button"
              title="Embed video"
              aria-label="Embed YouTube or Vimeo video"
              onClick={onInsertVideo}
              className="ql-custom-btn"
            >
              <VideoCameraIcon className="h-4 w-4" />
            </button>
          </span>
        )}

        {/* ── Clean ── */}
        <span className="ql-formats">
          <button type="button" className="ql-clean" />
        </span>
      </div>
    );
  }
);
