"use client";

// ─── ImageBlot — extended image blot with alt + caption support ───────────────
//
// Augments Quill's built-in image blot to preserve `alt`, `title`, and
// `data-caption` attributes in the saved HTML output.

import type Quill from "quill";

let registered = false;

export function registerImageBlot(QuillClass: typeof Quill): void {
  if (registered) return;
  registered = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BaseImage = QuillClass.import("formats/image") as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class ExtendedImage extends (BaseImage as any) {
    static blotName = "image";
    static tagName = "img";
    static ATTRIBUTES = ["alt", "height", "width", "title", "data-caption", "style"];

    static create(value: string): HTMLElement {
      const node = super.create(value) as HTMLElement;
      node.setAttribute("src", value);
      return node;
    }

    static value(node: HTMLElement): string {
      return node.getAttribute("src") ?? "";
    }

    static formats(node: HTMLElement): Record<string, string | null> {
      return ExtendedImage.ATTRIBUTES.reduce(
        (acc, attr) => {
          if (node.hasAttribute(attr)) acc[attr] = node.getAttribute(attr);
          return acc;
        },
        {} as Record<string, string | null>
      );
    }
  }

  QuillClass.register(
    "formats/image",
    ExtendedImage as unknown as Parameters<typeof QuillClass.register>[1],
    true // overwrite the existing built-in image blot
  );
}
