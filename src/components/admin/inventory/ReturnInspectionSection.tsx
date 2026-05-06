"use client";

import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/src/components/ui/Button";
import { Textarea } from "@/src/components/ui/Textarea";
import { Dropzone } from "@/src/components/ui/Dropzone";
import { ProductImageGallery, type GalleryMedia } from "@/src/components/product/ProductImageGallery";
import { useToast } from "@/src/components/ui/Toast";
import { uploadMediaFile } from "@/src/services/content.service";
import {
  addReturnAsset,
  updateInspectionResult,
  completeInspection,
  type ReturnAssetItem,
} from "@/src/services/returns.service";
import type { ReturnRequest } from "@/src/types/inventory.types";

// ─── InspectionPanel ──────────────────────────────────────────────────────────

export function InspectionPanel({
  returnId,
  existingResult,
  onDone,
}: {
  returnId: string;
  existingResult?: string;
  onDone: (updated: ReturnRequest) => void;
}) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [value, setValue]   = useState(existingResult ?? "");

  const isDirty = value.trim() !== (existingResult ?? "").trim();

  async function handleSave() {
    if (!value.trim()) {
      showToast("Vui lòng nhập kết quả kiểm tra.", "error");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateInspectionResult(returnId, value.trim());
      showToast("Đã lưu kết quả kiểm tra.", "success");
      onDone(updated);
    } catch (err) {
      showToast((err as Error)?.message || "Không thể lưu kết quả kiểm tra.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-secondary-900">Kết quả kiểm tra hàng</h3>
        <p className="mt-0.5 text-xs text-secondary-500">
          Ghi nhận tình trạng hàng thực tế sau khi nhận về kho — bắt buộc trước khi chọn phương án xử lý.
        </p>
      </div>
      <Textarea
        label="Kết quả kiểm tra"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="VD: Hàng bị trầy xước mặt trên, thiếu 1 phụ kiện sạc, hộp còn nguyên vẹn..."
        showCharCount
        maxCharCount={2000}
        rows={4}
      />
      <div className="flex justify-end">
        <Button
          variant="secondary"
          onClick={handleSave}
          disabled={saving || !isDirty}
          isLoading={saving}
        >
          {existingResult ? "Cập nhật kết quả" : "Lưu kết quả kiểm tra"}
        </Button>
      </div>
    </div>
  );
}

// ─── InspectionEvidencePanel ──────────────────────────────────────────────────

type StagedFile = { id: string; file: File; previewUrl: string };

export function InspectionEvidencePanel({
  returnId,
  canUpload,
  assets,
  onUploaded,
}: {
  returnId: string;
  canUpload: boolean;
  assets: ReturnAssetItem[];
  onUploaded: (updated: ReturnAssetItem[]) => void;
}) {
  const { showToast }       = useToast();
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [saving, setSaving] = useState(false);

  function addStagedFiles(files: File[]) {
    const newItems: StagedFile[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setStaged((s) => [...s, ...newItems]);
  }

  function removeStagedFile(id: string) {
    setStaged((s) => {
      const found = s.find((x) => x.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return s.filter((x) => x.id !== id);
    });
  }

  async function handleSave() {
    if (staged.length === 0) return;
    setSaving(true);
    const count = staged.length;
    try {
      let lastList: ReturnAssetItem[] = assets;
      for (const item of staged) {
        const media = await uploadMediaFile(item.file);
        lastList = await addReturnAsset(returnId, Number(media.id), "inspection_evidence");
      }
      staged.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setStaged([]);
      onUploaded(lastList);
      showToast(`Đã lưu ${count} ảnh bằng chứng kiểm tra.`, "success");
    } catch (err) {
      showToast((err as Error)?.message || "Không thể tải ảnh lên.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!canUpload && assets.length === 0) return null;

  const galleryItems: GalleryMedia[] = assets.map((a) => ({
    key:  String(a.id),
    src:  a.assetUrl!,
    alt:  "Ảnh kiểm tra hàng",
    type: "image" as const,
  }));

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-secondary-900">Ảnh bằng chứng kiểm tra</h3>
        <p className="mt-0.5 text-xs text-secondary-500">Ảnh chụp tình trạng hàng thực tế tại kho.</p>
      </div>

      {assets.length > 0 && (
        <div className="mx-auto max-w-sm xl:max-w-md">
          <ProductImageGallery items={galleryItems} />
        </div>
      )}

      {assets.length === 0 && !canUpload && (
        <p className="text-sm text-secondary-400">Chưa có ảnh bằng chứng kiểm tra.</p>
      )}

      {canUpload && (
        <div className="space-y-3">
          {(assets.length > 0 || staged.length > 0) && (
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Thêm ảnh mới</p>
          )}

          {staged.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {staged.map((item) => (
                <div
                  key={item.id}
                  className="relative h-20 w-20 overflow-hidden rounded-lg border border-secondary-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Xóa ảnh"
                    onClick={() => removeStagedFile(item.id)}
                    disabled={saving}
                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-error-600 text-xs font-bold text-white hover:bg-error-700 disabled:pointer-events-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <Dropzone
            multiple
            onFilesChange={addStagedFiles}
            aspectRatioHint="JPG / PNG / WEBP"
            maxSizeMB={10}
            disabled={saving}
          />

          {staged.length > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
              <p className="text-xs text-secondary-600">
                <span className="font-semibold">{staged.length}</span> ảnh chờ lưu
              </p>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                isLoading={saving}
              >
                Lưu {staged.length} ảnh
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ConfirmInspectionPanel ───────────────────────────────────────────────────

export function ConfirmInspectionPanel({
  returnId,
  hasResult,
  hasPhotos,
  onDone,
}: {
  returnId: string;
  hasResult: boolean;
  hasPhotos: boolean;
  onDone: (updated: ReturnRequest) => void;
}) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const canConfirm = hasResult && hasPhotos;

  async function handleConfirm() {
    setSaving(true);
    try {
      const updated = await completeInspection(returnId);
      showToast("Đã xác nhận hoàn tất kiểm tra.", "success");
      onDone(updated);
    } catch (err) {
      showToast((err as Error)?.message || "Không thể xác nhận kiểm tra.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-secondary-900">Hoàn tất kiểm tra</h3>
        <p className="mt-0.5 text-xs text-secondary-500">
          Xác nhận khi đã ghi đủ kết quả và tải lên ảnh bằng chứng — trạng thái sẽ chuyển sang Đã kiểm tra.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-1.5 text-xs">
          <CheckCircleIcon className={["h-4 w-4", hasResult ? "text-success-500" : "text-secondary-300"].join(" ")} />
          <span className={hasResult ? "text-secondary-700" : "text-secondary-400"}>Kết quả kiểm tra</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <CheckCircleIcon className={["h-4 w-4", hasPhotos ? "text-success-500" : "text-secondary-300"].join(" ")} />
          <span className={hasPhotos ? "text-secondary-700" : "text-secondary-400"}>Ảnh bằng chứng</span>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!canConfirm || saving}
          isLoading={saving}
        >
          Xác nhận đã kiểm tra xong
        </Button>
      </div>
    </div>
  );
}
