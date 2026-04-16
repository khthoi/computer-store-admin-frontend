"use client";

/**
 * DynamicRichTextEditor — SSR-safe wrapper around the CKEditor 5 RichTextEditor.
 *
 * CKEditor's ClassicEditor build accesses `window` at module-evaluation time,
 * which crashes Next.js server rendering. This file wraps the real editor in
 * next/dynamic with { ssr: false } so the bundle is only loaded in the browser.
 *
 * Import this file instead of ./RichTextEditor in any Next.js page or component:
 *
 *   import { RichTextEditor } from "@/src/components/editor/DynamicRichTextEditor";
 */

import dynamic from "next/dynamic";
import type { RichTextEditorProps } from "./RichTextEditor";

function EditorSkeleton() {
  return (
    <div className="w-full animate-pulse overflow-hidden rounded-lg border border-secondary-200 bg-secondary-50">
      {/* Toolbar skeleton */}
      <div className="flex items-center gap-1 border-b border-secondary-200 bg-secondary-100 px-3 py-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-6 w-6 rounded bg-secondary-200" />
        ))}
      </div>
      {/* Content area skeleton */}
      <div className="space-y-2 p-4">
        <div className="h-3 w-3/4 rounded bg-secondary-200" />
        <div className="h-3 w-full rounded bg-secondary-200" />
        <div className="h-3 w-5/6 rounded bg-secondary-200" />
      </div>
    </div>
  );
}

export const RichTextEditor = dynamic<RichTextEditorProps>(
  () =>
    import("./RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
  {
    ssr: false,
    loading: EditorSkeleton,
  },
);

export type { RichTextEditorProps };
