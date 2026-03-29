"use client";

// ─── VideoHandler ─────────────────────────────────────────────────────────────
//
// Provides a function to programmatically insert a VideoEmbedBlot into the
// editor at the current selection position.

import type Quill from "quill";

/**
 * Insert a video embed at the current cursor position.
 *
 * @param quill - The Quill editor instance
 * @param url   - YouTube or Vimeo URL (raw share URL or embed URL)
 */
export function insertVideoEmbed(quill: InstanceType<typeof Quill>, url: string): void {
  const range = quill.getSelection(true);
  const index = range ? range.index : quill.getLength();

  // Insert the custom blot
  quill.insertEmbed(index, "video-embed", url, "user");

  // Move the cursor past the inserted embed
  quill.setSelection(index + 1, 0);
  quill.focus();
}

/**
 * Insert a horizontal divider at the current cursor position.
 *
 * @param quill - The Quill editor instance
 */
export function insertDivider(quill: InstanceType<typeof Quill>): void {
  const range = quill.getSelection(true);
  const index = range ? range.index : quill.getLength();

  quill.insertEmbed(index, "divider", true, "user");
  quill.setSelection(index + 1, 0);
  quill.focus();
}
