import type { MediaFile } from "@/src/types/content.types";

const RENDERABLE_IMAGE_EXTENSIONS = [
  ".avif",
  ".bmp",
  ".gif",
  ".ico",
  ".icon",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".svgz",
  ".webp",
];

const CONTAINED_IMAGE_EXTENSIONS = [".ico", ".icon", ".svg", ".svgz"];

function stripQueryAndHash(value: string): string {
  return value.split(/[?#]/, 1)[0].toLowerCase();
}

export function hasRenderableImageExtension(value?: string | null): boolean {
  if (!value) return false;
  const path = stripQueryAndHash(value);
  return RENDERABLE_IMAGE_EXTENSIONS.some((ext) => path.endsWith(ext));
}

export function hasContainedImageExtension(value?: string | null): boolean {
  if (!value) return false;
  const path = stripQueryAndHash(value);
  return CONTAINED_IMAGE_EXTENSIONS.some((ext) => path.endsWith(ext));
}

export function isRenderableImageFile(file: Pick<MediaFile, "fileType" | "mimeType" | "filename" | "url">): boolean {
  return (
    file.fileType === "image" ||
    file.mimeType?.toLowerCase().startsWith("image/") ||
    hasRenderableImageExtension(file.filename) ||
    hasRenderableImageExtension(file.url)
  );
}

export function shouldContainImage(file: Pick<MediaFile, "mimeType" | "filename" | "url">): boolean {
  const mimeType = file.mimeType?.toLowerCase() ?? "";
  return (
    mimeType === "image/svg+xml" ||
    mimeType === "image/x-icon" ||
    mimeType === "image/vnd.microsoft.icon" ||
    hasContainedImageExtension(file.filename) ||
    hasContainedImageExtension(file.url)
  );
}

export function getMediaPreviewUrl(file: Pick<MediaFile, "thumbnailUrl" | "url" | "mimeType" | "filename">): string {
  return shouldContainImage(file) ? file.url : file.thumbnailUrl ?? file.url;
}
