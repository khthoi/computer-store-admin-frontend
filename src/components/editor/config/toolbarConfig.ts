"use client";

// ─── Toolbar configuration for Quill v2 ──────────────────────────────────────
//
// Each array entry = one group of toolbar buttons separated by a visual divider.
// Custom buttons (divider, video) are injected by EditorToolbar.tsx as plain
// <button> elements alongside the Quill container (not via Quill's toolbar API)
// so that they can trigger our own UI modals / logic.

export const TOOLBAR_CONFIG: (string | Record<string, unknown> | (string | Record<string, unknown>)[])[][] = [
  // Heading / paragraph style picker
  [{ header: [1, 2, 3, false] }],

  // Bold, italic, underline, strikethrough
  ["bold", "italic", "underline", "strike"],

  // Text colour + highlight (background colour)
  [{ color: [] }, { background: [] }],

  // Lists
  [{ list: "ordered" }, { list: "bullet" }],

  // Indentation
  [{ indent: "-1" }, { indent: "+1" }],

  // Alignment
  [{ align: [] }],

  // Inline code, code block, blockquote
  ["code", "code-block", "blockquote"],

  // Link & image (built-in Quill handlers)
  ["link", "image"],

  // Clean formatting
  ["clean"],
];

// Quill module config for toolbar — references the wrapper element by CSS class
export const TOOLBAR_MODULE = {
  toolbar: "#ql-toolbar-container",
};
