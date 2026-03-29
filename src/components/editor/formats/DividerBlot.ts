"use client";

// ─── DividerBlot — custom Quill v2 block-level embed ─────────────────────────
//
// Inserts a horizontal rule (<hr>) into the editor content.
// Usage:  quill.insertEmbed(index, 'divider', true, 'user');

import type Quill from "quill";

let registered = false;

export function registerDividerBlot(QuillClass: typeof Quill): void {
  if (registered) return;
  registered = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BlockEmbed = QuillClass.import("blots/block/embed") as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class DividerBlot extends (BlockEmbed as any) {
    static blotName = "divider";
    static tagName = "hr";
    static className = "ql-divider";

    static create(): HTMLElement {
      const node = super.create() as HTMLElement;
      node.setAttribute("contenteditable", "false");
      return node;
    }

    static value(): boolean {
      return true;
    }
  }

  QuillClass.register("formats/divider", DividerBlot as unknown as Parameters<typeof QuillClass.register>[1]);
}
