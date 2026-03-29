"use client";

import type Quill from "quill";

// ─── Quill initialisation options ────────────────────────────────────────────

export type QuillTheme = "snow";

export interface QuillInitOptions {
  /** CSS selector or DOM element for the toolbar. */
  toolbarContainer: string | HTMLElement;
  /** Initial HTML content. */
  initialHtml?: string;
  /** Placeholder shown when editor is empty. */
  placeholder?: string;
  /** Render in read-only mode. */
  readOnly?: boolean;
}

/** Build the options object passed to `new Quill(el, options)`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildQuillOptions(opts: QuillInitOptions): Record<string, any> {
  return {
    theme: "snow",
    placeholder: opts.placeholder ?? "Start writing…",
    readOnly: opts.readOnly ?? false,
    modules: {
      toolbar: opts.toolbarContainer,
      history: {
        delay: 1000,
        maxStack: 100,
        userOnly: true,
      },
      keyboard: {
        bindings: {
          // Allow Shift+Enter to insert a soft newline (single <br>)
          shiftEnter: {
            key: 13,
            shiftKey: true,
            handler(this: { quill: InstanceType<typeof Quill> }) {
              const range = this.quill.getSelection();
              if (range) {
                this.quill.insertText(range.index, "\n", "user");
                this.quill.setSelection(range.index + 1, 0);
              }
              return false;
            },
          },
        },
      },
    },
    formats: [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "color",
      "background",
      "list",
      "indent",
      "align",
      "code",
      "code-block",
      "blockquote",
      "link",
      "image",
      // Custom blots
      "divider",
      "video-embed",
    ],
  };
}
