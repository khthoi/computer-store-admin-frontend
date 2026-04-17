"use client";

import { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { Spinner } from "@/src/components/ui/Spinner";
import { Alert } from "@/src/components/ui/Alert";
import { useToast } from "@/src/components/ui/Toast";
import {
  fetchSlots,
  createSlot,
  updateSlot,
  deleteSlot,
  reorderSlots,
} from "@/src/services/buildpc.service";
import { SortableSlotRow } from "./SortableSlotRow";
import { SlotFormModal } from "./SlotFormModal";
import type { BuildPCSlot, BuildPCSlotFormData } from "@/src/types/buildpc.types";

// ─── Component ────────────────────────────────────────────────────────────────

export function BuildPCSlotsClient() {
  const { showToast } = useToast();

  const [slots, setSlots]           = useState<BuildPCSlot[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [formOpen, setFormOpen]     = useState(false);
  const [editing, setEditing]       = useState<BuildPCSlot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildPCSlot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true);
    fetchSlots()
      .then(setSlots)
      .catch(() => setError("Không thể tải danh sách khe linh kiện."))
      .finally(() => setLoading(false));
  }, []);

  // ── Reorder (drag-drop) ───────────────────────────────────────────────────

  async function handleReorder(newOrder: BuildPCSlot[]) {
    setSlots(newOrder);
    try {
      await reorderSlots(newOrder.map((s) => s.id));
    } catch {
      showToast("Không thể lưu thứ tự. Vui lòng thử lại.", "error");
    }
  }

  // ── Toggle active ─────────────────────────────────────────────────────────

  async function handleToggleActive(slot: BuildPCSlot, active: boolean) {
    const original = slots;
    setSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, isActive: active } : s)));
    try {
      await updateSlot(slot.id, { ...slotToFormData(slot), isActive: active });
    } catch {
      setSlots(original);
      showToast("Không thể cập nhật trạng thái.", "error");
    }
  }

  // ── Create / update ───────────────────────────────────────────────────────

  async function handleSubmit(data: BuildPCSlotFormData) {
    if (editing) {
      const updated = await updateSlot(editing.id, data);
      setSlots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showToast("Đã cập nhật khe linh kiện.", "success");
    } else {
      const created = await createSlot(data);
      setSlots((prev) => [...prev, created].sort((a, b) => a.thuTu - b.thuTu));
      showToast("Đã thêm khe linh kiện.", "success");
    }
    setEditing(null);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSlot(deleteTarget.id);
      setSlots((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      showToast("Đã xóa khe linh kiện.", "success");
      setDeleteTarget(null);
    } catch {
      showToast("Không thể xóa khe. Vui lòng thử lại.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Khe linh kiện</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Quản lý các khe trong bộ công cụ Build PC. Kéo để sắp xếp thứ tự hiển thị.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => { setEditing(null); setFormOpen(true); }}
        >
          <PlusIcon className="h-4 w-4" />
          Thêm khe
        </Button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : slots.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-secondary-200 py-16 text-secondary-400">
          <p className="text-sm">Chưa có khe linh kiện nào.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            Thêm khe đầu tiên
          </Button>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={slots}
          onReorder={handleReorder}
          className="space-y-2"
        >
          {slots.map((slot, idx) => (
            <SortableSlotRow
              key={slot.id}
              slot={slot}
              index={idx + 1}
              onEdit={(s) => { setEditing(s); setFormOpen(true); }}
              onDelete={setDeleteTarget}
              onToggleActive={handleToggleActive}
            />
          ))}
        </Reorder.Group>
      )}

      {/* Form modal */}
      <SlotFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        editing={editing}
        nextThuTu={slots.length + 1}
      />

      {/* Delete confirm modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Xóa khe linh kiện?"
        size="sm"
        animated
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
              Xóa
            </Button>
          </div>
        }
      >
        <p className="text-sm text-secondary-600">
          Khe{" "}
          <strong className="font-semibold text-secondary-800">
            {deleteTarget?.tenKhe}
          </strong>{" "}
          sẽ bị xóa vĩnh viễn. Các quy tắc tương thích tham chiếu đến khe này cũng có thể
          bị ảnh hưởng.
        </p>
      </Modal>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function slotToFormData(s: BuildPCSlot): BuildPCSlotFormData {
  return {
    tenKhe: s.tenKhe,
    maKhe: s.maKhe,
    danhMucId: s.danhMucId,
    soLuong: s.soLuong,
    batBuoc: s.batBuoc,
    thuTu: s.thuTu,
    moTa: s.moTa ?? "",
    isActive: s.isActive,
  };
}
