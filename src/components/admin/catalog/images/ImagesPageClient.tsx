"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/src/components/ui/Toast";
import { MediaUploadPanel, type MediaImage } from "@/src/components/admin/shared/MediaUploadPanel";
import type { HinhAnhSanPham } from "@/src/types/image.types";
import { uploadImages, deleteImage, reorderImages } from "@/src/services/image.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toMediaImage(img: HinhAnhSanPham): MediaImage {
  return { id: img.id, url: img.url, alt: img.alt };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ImagesPageClientProps {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  initialImages: HinhAnhSanPham[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ImagesPageClient({
  productId,
  productName,
  variantId,
  variantName,
  initialImages,
}: ImagesPageClientProps) {
  const { showToast } = useToast();
  const [images, setImages] = useState<MediaImage[]>(initialImages.map(toMediaImage));

  async function handleAdd(files: File[]) {
    // Optimistic: show placeholders with progress = 0
    const placeholders: MediaImage[] = files.map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      url: URL.createObjectURL(f),
      alt: f.name,
      uploadProgress: 0,
    }));
    setImages((prev) => [...prev, ...placeholders]);

    try {
      const uploaded = await uploadImages(variantId, files);
      // Replace placeholders with real images
      setImages((prev) => {
        const withoutPlaceholders = prev.filter(
          (img) => !placeholders.some((p) => p.id === img.id)
        );
        return [...withoutPlaceholders, ...uploaded.map(toMediaImage)];
      });
      showToast("Đã tải lên ảnh thành công.", "success");
    } catch {
      // Remove placeholders on error
      setImages((prev) =>
        prev.filter((img) => !placeholders.some((p) => p.id === img.id))
      );
      showToast("Có lỗi khi tải ảnh. Vui lòng thử lại.", "error");
    }
  }

  async function handleRemove(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
    try {
      await deleteImage(variantId, id);
      showToast("Đã xóa ảnh.", "success");
    } catch {
      showToast("Có lỗi khi xóa ảnh. Vui lòng thử lại.", "error");
    }
  }

  async function handleReorder(newOrder: MediaImage[]) {
    setImages(newOrder);
    try {
      await reorderImages(variantId, newOrder.map((img) => img.id));
    } catch {
      showToast("Không thể lưu thứ tự. Vui lòng thử lại.", "error");
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Back link */}
      <Link
        href={`/products/${productId}/variants`}
        className="inline-flex items-center gap-1.5 text-sm text-secondary-500 transition-colors hover:text-secondary-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Phiên bản sản phẩm
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Hình ảnh phiên bản</h1>
        <p className="mt-1 text-sm text-secondary-500">
          {productName} — {variantName}
        </p>
      </div>

      {/* Upload panel */}
      <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
          Quản lý hình ảnh
        </h2>
        <MediaUploadPanel
          images={images}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onReorder={handleReorder}
          maxImages={10}
        />
      </div>
    </div>
  );
}
