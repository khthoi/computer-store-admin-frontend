"use client";

import { useEffect, useRef, useState } from "react";
import { Reorder } from "framer-motion";
import { PlusIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useToast } from "@/src/components/ui/Toast";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { SortableSectionRow } from "./SortableSectionRow";
import { SectionFormModal } from "./SectionFormModal";
import {
  getHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  duplicateHomepageSection,
  reorderHomepageSections,
} from "@/src/services/homepage.service";
import type { HomepageSection, HomepageSectionFormData } from "@/src/types/homepage.types";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} variant="rect" className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-secondary-200 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-100">
        <Bars3Icon className="h-8 w-8 text-secondary-400" />
      </div>
      <div>
        <p className="text-base font-semibold text-secondary-700">Chưa có khối sản phẩm nào</p>
        <p className="mt-1 text-sm text-secondary-400">
          Thêm khối đầu tiên để bắt đầu cấu hình trang chủ
        </p>
      </div>
      <Button variant="primary" leftIcon={<PlusIcon className="h-4 w-4" />} onClick={onAdd}>
        Thêm khối sản phẩm
      </Button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HomepageSectionClient() {
  const { showToast } = useToast();

  // ── Data state ─────────────────────────────────────────────────────────────
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const sectionsRef = useRef<HomepageSection[]>([]);
  const syncSections = (next: HomepageSection[]) => {
    setSections(next);
    sectionsRef.current = next;
  };
  const [isLoading, setIsLoading] = useState(true);

  // ── Reorder state ──────────────────────────────────────────────────────────
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [formTarget, setFormTarget] = useState<HomepageSection | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<HomepageSection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    getHomepageSections().then((data) => {
      syncSections(data);
      setIsLoading(false);
    });
  }, []);

  // ── Reorder ────────────────────────────────────────────────────────────────
  function handleReorder(newOrder: HomepageSection[]) {
    syncSections(newOrder);
    setIsDirty(true);
  }

  async function handleSaveOrder() {
    setIsSaving(true);
    try {
      await reorderHomepageSections(sectionsRef.current.map((s) => s.sectionId));
      setIsDirty(false);
      showToast("Đã lưu thứ tự", "success");
    } catch {
      showToast("Lưu thứ tự thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Create / Update ────────────────────────────────────────────────────────
  async function handleSave(data: HomepageSectionFormData) {
    try {
      if (formTarget === "new") {
        const created = await createHomepageSection(data);
        syncSections([...sectionsRef.current, created]);
        showToast("Đã tạo khối sản phẩm", "success");
      } else if (formTarget) {
        const updated = await updateHomepageSection(formTarget.sectionId, data);
        syncSections(sectionsRef.current.map((s) =>
          s.sectionId === updated.sectionId ? updated : s
        ));
        showToast("Đã cập nhật khối sản phẩm", "success");
      }
      setFormTarget(null);
    } catch {
      showToast("Lưu thất bại", "error");
      throw new Error("save failed");
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteHomepageSection(deleteTarget.sectionId);
      syncSections(sectionsRef.current.filter((s) => s.sectionId !== deleteTarget.sectionId));
      setDeleteTarget(null);
      showToast("Đã xóa khối sản phẩm", "success");
    } catch {
      showToast("Xóa thất bại", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Duplicate ──────────────────────────────────────────────────────────────
  async function handleDuplicate(section: HomepageSection) {
    try {
      const copy = await duplicateHomepageSection(section.sectionId);
      syncSections([...sectionsRef.current, copy]);
      showToast(`Đã nhân bản "${section.title}"`, "success");
    } catch {
      showToast("Nhân bản thất bại", "error");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary-500">
          {sections.length} khối sản phẩm
          {sections.length > 1 && (
            <span className="ml-1.5 text-secondary-400">
              · kéo <Bars3Icon className="inline h-3 w-3" /> để sắp xếp
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveOrder}
              isLoading={isSaving}
            >
              Lưu thứ tự
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<PlusIcon className="h-4 w-4" />}
            onClick={() => setFormTarget("new")}
          >
            Thêm khối mới
          </Button>
        </div>
      </div>

      {/* List */}
      {sections.length === 0 ? (
        <EmptyState onAdd={() => setFormTarget("new")} />
      ) : (
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={handleReorder}
          as="div"
          className="flex flex-col gap-2"
          style={{ touchAction: "none" }}
        >
          {sections.map((section, idx) => (
            <SortableSectionRow
              key={section.sectionId}
              section={section}
              index={idx + 1}
              onEdit={(s) => setFormTarget(s)}
              onDelete={(s) => setDeleteTarget(s)}
              onDuplicate={handleDuplicate}
            />
          ))}
        </Reorder.Group>
      )}

      {/* Summary footer */}
      {sections.length > 0 && (
        <div className="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-secondary-500">
            <span>
              <span className="font-semibold text-secondary-700">
                {sections.filter((s) => s.isVisible).length}
              </span>{" "}
              đang hiển thị
            </span>
            <span>
              <span className="font-semibold text-secondary-700">
                {sections.filter((s) => !s.isVisible).length}
              </span>{" "}
              đang ẩn
            </span>
            <span>
              <span className="font-semibold text-secondary-700">
                {sections.filter((s) => s.ngayKetThuc).length}
              </span>{" "}
              có lịch hết hạn
            </span>
            <span>
              <span className="font-semibold text-secondary-700">
                {sections.filter((s) => s.type === "manual").length}
              </span>{" "}
              thủ công
            </span>
          </div>
        </div>
      )}

      {/* Form modal */}
      {formTarget !== null && (
        <SectionFormModal
          section={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa khối sản phẩm"
        description={`Xóa khối "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        variant="danger"
        isConfirming={isDeleting}
      />
    </div>
  );
}
