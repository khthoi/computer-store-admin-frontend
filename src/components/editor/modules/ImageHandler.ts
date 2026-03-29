"use client";

// ─── ImageHandler ─────────────────────────────────────────────────────────────
//
// Replaces Quill's default image toolbar button behaviour with a file-picker
// that reads the selected image as a base64 data URL and inserts it inline.
//
// In production you would upload the file to a storage service first and insert
// the returned CDN URL instead. The `uploadFn` option supports both patterns.

import type Quill from "quill";

export type UploadFn = (file: File) => Promise<string>;

const DEFAULT_ACCEPTED = "image/jpeg,image/png,image/gif,image/webp,image/svg+xml";

/** Default inline base64 handler (no upload required). */
async function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Attach a custom image-insertion handler to a Quill instance.
 *
 * @param quill   - The Quill editor instance
 * @param upload  - Optional async function that returns a public URL for the
 *                  uploaded image; falls back to inline base64.
 */
export function attachImageHandler(quill: InstanceType<typeof Quill>, upload?: UploadFn): void {
  const toolbar = quill.getModule("toolbar") as {
    addHandler(name: string, handler: () => void): void;
  };

  toolbar.addHandler("image", () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", DEFAULT_ACCEPTED);
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const savedRange = quill.getSelection(true);
      quill.blur();

      try {
        const url = upload ? await upload(file) : await readAsDataUrl(file);
        const index = savedRange ? savedRange.index : quill.getLength();
        quill.insertEmbed(index, "image", url, "user");
        quill.setSelection(index + 1, 0);
        quill.focus();
      } catch (err) {
        console.error("[RichTextEditor] Image insertion failed:", err);
        quill.focus();
      }
    };
  });
}
