// ─── Rich Text Editor — public API ───────────────────────────────────────────
//
// Import the editor with dynamic() at the usage site to prevent SSR:
//
//   import dynamic from "next/dynamic";
//   const RichTextEditor = dynamic(
//     () => import("@/src/components/editor").then((m) => ({ default: m.RichTextEditor })),
//     { ssr: false }
//   );

export { RichTextEditor } from "@/src/components/editor/RichTextEditor";
export type { RichTextEditorProps } from "@/src/components/editor/RichTextEditor";

export { EditorContainer } from "@/src/components/editor/EditorContainer";
export { EditorToolbar } from "@/src/components/editor/EditorToolbar";
export { EditorContent } from "@/src/components/editor/EditorContent";
export { VideoEmbedModal } from "@/src/components/editor/modules/VideoEmbedModal";

export { useQuillEditor } from "@/src/components/editor/hooks/useQuillEditor";
export type { UseQuillEditorOptions, UseQuillEditorReturn } from "@/src/components/editor/hooks/useQuillEditor";

export type { UploadFn } from "@/src/components/editor/modules/ImageHandler";
