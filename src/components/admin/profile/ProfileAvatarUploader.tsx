"use client";

import { useCallback, useRef, useState } from "react";
import { CameraIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Avatar } from "@/src/components/ui/Avatar";
import { useToast } from "@/src/components/ui/Toast";
import { updateCurrentAvatar } from "@/src/services/profile.service";
import type { NhanVien } from "@/src/types/employee.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileAvatarUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  employee: NhanVien;
  onSaved: (avatarUrl: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileAvatarUploader({
  isOpen,
  onClose,
  employee,
  onSaved,
}: ProfileAvatarUploaderProps) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (!selected) return;
      if (!selected.type.startsWith("image/")) {
        showToast("Chỉ chấp nhận file hình ảnh.", "error");
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        showToast("Kích thước file không được vượt quá 5 MB.", "error");
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    },
    [showToast]
  );

  const handleClose = useCallback(() => {
    setPreview(null);
    setFile(null);
    onClose();
  }, [onClose]);

  const handleSave = useCallback(async () => {
    if (!file) return;
    setIsSaving(true);
    try {
      const { avatarUrl } = await updateCurrentAvatar(file);
      showToast("Cập nhật ảnh đại diện thành công.", "success");
      onSaved(avatarUrl);
      handleClose();
    } catch {
      showToast("Tải ảnh thất bại, vui lòng thử lại.", "error");
    } finally {
      setIsSaving(false);
    }
  }, [file, showToast, onSaved, handleClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Đổi ảnh đại diện"
      size="lg"
      animated
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!file || isSaving}
          >
            {isSaving ? "Đang tải lên…" : "Lưu ảnh"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-5 py-2">
        {/* Preview */}
        <div className="relative">
          <Avatar
            src={preview ?? employee.avatarUrl}
            name={employee.fullName}
            size="5xl"
            shape="circle"
            className="ring-4 ring-secondary-100"
          />
          {preview && (
            <button
              type="button"
              aria-label="Xóa ảnh đã chọn"
              onClick={() => { setPreview(null); setFile(null); }}
              className="absolute -top-1 -right-1 flex items-center justify-center w-7 h-7 rounded-full bg-error-100 text-error-600 hover:bg-error-200 transition-colors"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Upload area */}
        <div className="w-full">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Chọn ảnh đại diện"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-secondary-300 px-4 py-6 text-sm text-secondary-500 transition-colors hover:border-primary-400 hover:bg-primary-50/40 hover:text-primary-600"
          >
            <CameraIcon className="h-7 w-7" />
            <span>
              {file ? file.name : "Nhấn để chọn ảnh (tối đa 5 MB)"}
            </span>
          </button>
          <p className="mt-2 text-center text-xs text-secondary-400">
            Định dạng hỗ trợ: JPG, PNG, WebP · Tỷ lệ đề nghị 1:1
          </p>
        </div>
      </div>
    </Modal>
  );
}
