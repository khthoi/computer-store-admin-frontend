"use client";

import { useEffect, useRef, useCallback } from "react";
import type Quill from "quill";
import type { UploadFn } from "@/src/components/editor/modules/ImageHandler";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseQuillEditorOptions {
  /** Initial HTML value to seed the editor with. */
  value?: string;
  /** Controlled value (replaces content when changed externally). */
  controlledValue?: string;
  /** Placeholder text shown when empty. */
  placeholder?: string;
  /** Whether the editor should be read-only. */
  readOnly?: boolean;
  /** Max character count before the counter turns red. */
  maxLength?: number;
  /** Called on every content change with the current HTML string. */
  onChange?: (html: string) => void;
  /** Optional async function to upload images; falls back to base64. */
  uploadFn?: UploadFn;
  /** Called when user requests to open the video embed modal. */
  onVideoInsertRequest?: () => void;
  /** Called when user clicks the divider button. */
  onDividerInsert?: () => void;
}

export interface UseQuillEditorReturn {
  /** Ref to attach to the toolbar container div. */
  toolbarRef: React.RefObject<HTMLDivElement | null>;
  /** Ref to attach to the Quill editor container div. */
  editorRef: React.RefObject<HTMLDivElement | null>;
  /** The live Quill instance (null until mounted). */
  quillRef: React.RefObject<InstanceType<typeof Quill> | null>;
  /** Programmatically get the current HTML content. */
  getHTML: () => string;
  /** Programmatically set the HTML content. */
  setHTML: (html: string) => void;
  /** Clear all content. */
  clearContent: () => void;
  /** Insert a video embed at the current selection. */
  insertVideo: (url: string) => void;
  /** Insert a horizontal divider at the current selection. */
  insertDivider: () => void;
  /** Current character count. */
  charCount: React.RefObject<number>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQuillEditor(opts: UseQuillEditorOptions): UseQuillEditorReturn {
  const {
    value,
    controlledValue,
    placeholder,
    readOnly,
    onChange,
    uploadFn,
  } = opts;

  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<InstanceType<typeof Quill> | null>(null);
  const charCount = useRef<number>(0);
  const onChangeRef = useRef(onChange);
  const isInternalChange = useRef(false);

  // Keep onChange ref current
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // ── Initialise Quill (runs once on mount) ──────────────────────────────────
  useEffect(() => {
    if (!editorRef.current || !toolbarRef.current) return;

    let quillInstance: InstanceType<typeof Quill> | null = null;

    (async () => {
      // Dynamic import to keep Quill client-side only
      const [
        { default: Quill },
        { buildQuillOptions },
        { registerDividerBlot },
        { registerVideoBlot },
        { registerImageBlot },
        { attachImageHandler },
        { insertVideoEmbed: _insertVideoEmbed, insertDivider: _insertDividerFn },
      ] = await Promise.all([
        import("quill"),
        import("@/src/components/editor/config/quillConfig"),
        import("@/src/components/editor/formats/DividerBlot"),
        import("@/src/components/editor/formats/VideoBlot"),
        import("@/src/components/editor/formats/ImageBlot"),
        import("@/src/components/editor/modules/ImageHandler"),
        import("@/src/components/editor/modules/VideoHandler"),
      ]);

      // Register custom blots before creating the instance
      registerDividerBlot(Quill);
      registerVideoBlot(Quill);
      registerImageBlot(Quill);

      if (!editorRef.current || !toolbarRef.current) return;

      const options = buildQuillOptions({
        toolbarContainer: toolbarRef.current,
        placeholder,
        readOnly,
      });

      quillInstance = new Quill(editorRef.current, options);
      quillRef.current = quillInstance;

      // Seed initial content
      if (value) {
        quillInstance.clipboard.dangerouslyPasteHTML(value, "api");
        charCount.current = quillInstance.getText().replace(/\n$/, "").length;
      }

      // Attach image handler
      attachImageHandler(quillInstance, uploadFn);

      // Listen for text changes
      quillInstance.on("text-change", (_delta, _old, source) => {
        if (source === "api") return; // ignore programmatic updates

        isInternalChange.current = true;
        const html = quillInstance!.root.innerHTML;
        charCount.current = quillInstance!.getText().replace(/\n$/, "").length;

        // Treat "<p><br></p>" (empty Quill default) as truly empty
        const sanitised = html === "<p><br></p>" ? "" : html;
        onChangeRef.current?.(sanitised);
        isInternalChange.current = false;
      });
    })();

    return () => {
      // Quill v2 doesn't expose a public destroy() but we can clear the DOM
      if (quillInstance) {
        quillInstance.off("text-change");
        quillRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — we only want to init once

  // ── Sync external controlled value ────────────────────────────────────────
  useEffect(() => {
    if (
      quillRef.current &&
      controlledValue !== undefined &&
      !isInternalChange.current
    ) {
      const currentHtml = quillRef.current.root.innerHTML;
      const normalised = currentHtml === "<p><br></p>" ? "" : currentHtml;
      if (normalised !== controlledValue) {
        quillRef.current.clipboard.dangerouslyPasteHTML(controlledValue ?? "", "api");
      }
    }
  }, [controlledValue]);

  // ── Public API ─────────────────────────────────────────────────────────────

  const getHTML = useCallback((): string => {
    if (!quillRef.current) return "";
    const html = quillRef.current.root.innerHTML;
    return html === "<p><br></p>" ? "" : html;
  }, []);

  const setHTML = useCallback((html: string): void => {
    quillRef.current?.clipboard.dangerouslyPasteHTML(html, "api");
  }, []);

  const clearContent = useCallback((): void => {
    quillRef.current?.setContents([], "api");
  }, []);

  const insertVideo = useCallback((url: string): void => {
    if (!quillRef.current) return;
    // Import dynamically to avoid circular dep at module level
    import("@/src/components/editor/modules/VideoHandler").then(
      ({ insertVideoEmbed }) => {
        if (quillRef.current) insertVideoEmbed(quillRef.current, url);
      }
    );
  }, []);

  const insertDivider = useCallback((): void => {
    if (!quillRef.current) return;
    import("@/src/components/editor/modules/VideoHandler").then(
      ({ insertDivider: insertDividerFn }) => {
        if (quillRef.current) insertDividerFn(quillRef.current);
      }
    );
  }, []);

  return {
    toolbarRef,
    editorRef,
    quillRef,
    getHTML,
    setHTML,
    clearContent,
    insertVideo,
    insertDivider,
    charCount,
  };
}
