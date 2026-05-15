"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Toggle } from "@/src/components/ui/Toggle";
import type { MediaFolder } from "@/src/types/content.types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const FolderSchema = z.object({
  tenHienThi: z.string().min(1, "Vui lòng nhập tên thư mục.").max(100),
  duongDan: z
    .string()
    .min(1, "Vui lòng nhập đường dẫn Cloudinary.")
    .max(255)
    .regex(/^[a-z0-9/_-]+$/, "Chỉ dùng chữ thường, số, dấu gạch ngang, gạch dưới và dấu /"),
  moTa: z.string().max(500).optional(),
  loaiChoPhep: z.enum(["all", "image", "video", "raw"]),
  isActive: z.boolean(),
});

type FolderFormValues = z.infer<typeof FolderSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FolderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When provided, the form operates in edit mode */
  folder?: MediaFolder;
  /** Slugs of all existing folders — used to catch duplicates before submitting */
  existingPaths?: string[];
  onSubmit: (values: FolderFormValues) => Promise<void>;
}

// ─── Allowed type options ─────────────────────────────────────────────────────

const ALLOWED_TYPE_OPTIONS: { value: FolderFormValues["loaiChoPhep"]; label: string }[] = [
  { value: "all", label: "Tất cả loại file" },
  { value: "image", label: "Chỉ hình ảnh" },
  { value: "video", label: "Chỉ video" },
  { value: "raw", label: "Chỉ tài liệu (raw)" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function FolderFormModal({ isOpen, onClose, folder, existingPaths, onSubmit }: FolderFormModalProps) {
  const isEdit = folder != null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FolderFormValues>({
    resolver: zodResolver(FolderSchema),
    defaultValues: {
      tenHienThi: "",
      duongDan: "",
      moTa: "",
      loaiChoPhep: "all",
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        isEdit
          ? {
              tenHienThi: folder.name,
              duongDan: folder.slug,
              moTa: folder.description ?? "",
              loaiChoPhep: folder.allowedTypes ?? "all",
              isActive: folder.isActive ?? true,
            }
          : { tenHienThi: "", duongDan: "", moTa: "", loaiChoPhep: "all", isActive: true },
      );
    }
  }, [isOpen, isEdit, folder, reset]);

  const isActive = watch("isActive");
  const loaiChoPhep = watch("loaiChoPhep");

  async function handleFormSubmit(values: FolderFormValues) {
    const normalized = { ...values, duongDan: values.duongDan.replace(/^\/+/, "") };
    if (!normalized.duongDan) {
      setError("duongDan", { message: "Vui lòng nhập đường dẫn Cloudinary." });
      return;
    }
    if (!isEdit && existingPaths?.includes(normalized.duongDan)) {
      setError("duongDan", { message: "Đường dẫn này đã tồn tại. Vui lòng chọn đường dẫn khác." });
      return;
    }
    await onSubmit(normalized);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      animated
      title={isEdit ? "Chỉnh sửa thư mục" : "Tạo thư mục mới"}
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button
            type="submit"
            form="folder-form"
            isLoading={isSubmitting}
          >
            {isEdit ? "Lưu thay đổi" : "Tạo thư mục"}
          </Button>
        </div>
      }
    >
      <form id="folder-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <Input
          label="Tên hiển thị"
          placeholder="VD: Ảnh sản phẩm"
          errorMessage={errors.tenHienThi?.message}
          {...register("tenHienThi")}
        />

        <Input
          label="Đường dẫn Cloudinary"
          placeholder="VD: pc-store/products"
          helperText="Đường dẫn thư mục trên Cloudinary (chữ thường, dấu /)"
          errorMessage={errors.duongDan?.message}
          disabled={isEdit}
          {...register("duongDan")}
        />

        <Textarea
          label="Mô tả (tuỳ chọn)"
          placeholder="Mô tả ngắn về thư mục này"
          rows={2}
          errorMessage={errors.moTa?.message}
          {...register("moTa")}
          showCharCount
          maxCharCount={250}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700">
            Loại file cho phép
          </label>
          <div className="flex flex-wrap gap-2">
            {ALLOWED_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("loaiChoPhep", opt.value)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  loaiChoPhep === opt.value
                    ? "bg-primary-600 text-white"
                    : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-secondary-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-secondary-700">Kích hoạt thư mục</p>
            <p className="text-xs text-secondary-400">Thư mục bị tắt sẽ không xuất hiện khi upload file</p>
          </div>
          <Toggle
            checked={isActive}
            onChange={(e) => setValue("isActive", e.target.checked)}
          />
        </div>
      </form>
    </Modal>
  );
}
