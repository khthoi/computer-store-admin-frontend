"use client";

// ─── VideoBlot — responsive YouTube / Vimeo iframe embed ─────────────────────
//
// Inserts a 16:9 responsive wrapper around an <iframe>.
// Usage:  quill.insertEmbed(index, 'video-embed', url, 'user');

import type Quill from "quill";

let registered = false;

/** Convert a YouTube or Vimeo share URL into an embeddable src URL. */
export function normaliseVideoUrl(url: string): string {
  // YouTube: https://www.youtube.com/watch?v=ID  →  https://www.youtube-nocookie.com/embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  }

  // Vimeo: https://vimeo.com/ID  →  https://player.vimeo.com/video/ID
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Already an embed URL or other — return as-is
  return url;
}

export function registerVideoBlot(QuillClass: typeof Quill): void {
  if (registered) return;
  registered = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BlockEmbed = QuillClass.import("blots/block/embed") as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class VideoEmbedBlot extends (BlockEmbed as any) {
    static blotName = "video-embed";
    static tagName = "div";
    static className = "ql-video-embed";

    static create(url: string): HTMLElement {
      const wrapper = super.create() as HTMLElement;
      wrapper.setAttribute("contenteditable", "false");

      const iframe = document.createElement("iframe");
      iframe.setAttribute("src", normaliseVideoUrl(url));
      iframe.setAttribute("allowfullscreen", "true");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      );
      wrapper.appendChild(iframe);
      return wrapper;
    }

    static value(node: HTMLElement): string {
      const iframe = node.querySelector("iframe");
      return iframe?.getAttribute("src") ?? "";
    }
  }

  QuillClass.register(
    "formats/video-embed",
    VideoEmbedBlot as unknown as Parameters<typeof QuillClass.register>[1]
  );
}
