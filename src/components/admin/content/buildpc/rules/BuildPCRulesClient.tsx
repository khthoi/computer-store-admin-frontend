"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { Spinner } from "@/src/components/ui/Spinner";
import { Alert } from "@/src/components/ui/Alert";
import { Accordion } from "@/src/components/ui/Accordion";
import { Badge } from "@/src/components/ui/Badge";
import { useToast } from "@/src/components/ui/Toast";
import {
  fetchRules,
  fetchSlots,
  createRule,
  updateRule,
  deleteRule,
} from "@/src/services/buildpc.service";
import { RuleRow } from "./RuleRow";
import { RuleFormModal } from "./RuleFormModal";
import type { BuildPCRule, BuildPCRuleFormData, BuildPCSlot } from "@/src/types/buildpc.types";

// ─── Component ────────────────────────────────────────────────────────────────

export function BuildPCRulesClient() {
  const { showToast } = useToast();

  const [rules, setRules]       = useState<BuildPCRule[]>([]);
  const [slots, setSlots]       = useState<BuildPCSlot[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [formOpen, setFormOpen]         = useState(false);
  const [editing, setEditing]           = useState<BuildPCRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildPCRule | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchRules(), fetchSlots()])
      .then(([r, s]) => { setRules(r); setSlots(s); })
      .catch(() => setError("Không thể tải dữ liệu quy tắc."))
      .finally(() => setLoading(false));
  }, []);

  // ── Group rules by nguon slot ─────────────────────────────────────────────

  const grouped = useMemo(() => {
    const map = new Map<string, { slotTen: string; rules: BuildPCRule[] }>();
    for (const rule of rules) {
      if (!map.has(rule.slotNguonId)) {
        map.set(rule.slotNguonId, { slotTen: rule.slotNguonTen, rules: [] });
      }
      map.get(rule.slotNguonId)!.rules.push(rule);
    }
    return Array.from(map.entries()).map(([slotId, { slotTen, rules: rs }]) => ({
      slotId,
      slotTen,
      rules: rs,
    }));
  }, [rules]);

  // ── Toggle active ─────────────────────────────────────────────────────────

  async function handleToggleActive(rule: BuildPCRule, active: boolean) {
    const original = rules;
    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, isActive: active } : r)));
    try {
      await updateRule(rule.id, { ...ruleToFormData(rule), isActive: active });
    } catch {
      setRules(original);
      showToast("Không thể cập nhật trạng thái.", "error");
    }
  }

  // ── Create / update ───────────────────────────────────────────────────────

  async function handleSubmit(data: BuildPCRuleFormData) {
    if (editing) {
      const updated = await updateRule(editing.id, data);
      setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast("Đã cập nhật quy tắc.", "success");
    } else {
      const created = await createRule(data);
      setRules((prev) => [...prev, created]);
      showToast("Đã thêm quy tắc tương thích.", "success");
    }
    setEditing(null);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteRule(deleteTarget.id);
      setRules((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      showToast("Đã xóa quy tắc.", "success");
      setDeleteTarget(null);
    } catch {
      showToast("Không thể xóa quy tắc. Vui lòng thử lại.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const accordionItems = grouped.map(({ slotId, slotTen, rules: slotRules }) => ({
    value: slotId,
    label: (
      <span className="flex items-center gap-2">
        <span className="font-semibold">{slotTen}</span>
        <Badge variant="default" size="sm">{slotRules.length} quy tắc</Badge>
        {slotRules.some((r) => !r.isActive) && (
          <Badge variant="warning" size="sm">
            {slotRules.filter((r) => !r.isActive).length} tắt
          </Badge>
        )}
      </span>
    ),
    children: (
      <div className="space-y-2">
        {slotRules.map((rule) => (
          <RuleRow
            key={rule.id}
            rule={rule}
            onEdit={(r) => { setEditing(r); setFormOpen(true); }}
            onDelete={setDeleteTarget}
            onToggleActive={handleToggleActive}
          />
        ))}
      </div>
    ),
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Quy tắc tương thích</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Định nghĩa các điều kiện linh kiện phải thỏa mãn khi người dùng Build PC.
            Nhóm theo khe nguồn.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => { setEditing(null); setFormOpen(true); }}
          disabled={slots.length < 2}
        >
          <PlusIcon className="h-4 w-4" />
          Thêm quy tắc
        </Button>
      </div>

      {slots.length < 2 && !loading && (
        <Alert variant="warning">
          Cần ít nhất 2 khe linh kiện trước khi tạo quy tắc tương thích.{" "}
          <a href="/content/buildpc/slots" className="font-semibold underline">
            Quản lý khe
          </a>
        </Alert>
      )}

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-secondary-200 py-16 text-secondary-400">
          <p className="text-sm">Chưa có quy tắc tương thích nào.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => { setEditing(null); setFormOpen(true); }}
            disabled={slots.length < 2}
          >
            Thêm quy tắc đầu tiên
          </Button>
        </div>
      ) : (
        <Accordion
          items={accordionItems}
          multiple
          variant="separated"
          defaultValue={grouped.map((g) => g.slotId)}
        />
      )}

      {/* Form modal */}
      <RuleFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        editing={editing}
        slots={slots}
      />

      {/* Delete confirm modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Xóa quy tắc tương thích?"
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
          Quy tắc{" "}
          <strong className="font-semibold text-secondary-800">
            {deleteTarget?.slotNguonTen} → {deleteTarget?.slotDichTen}
          </strong>{" "}
          ({deleteTarget?.maKyThuatTen}) sẽ bị xóa vĩnh viễn.
        </p>
      </Modal>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function ruleToFormData(r: BuildPCRule): BuildPCRuleFormData {
  return {
    slotNguonId: r.slotNguonId,
    slotDichId: r.slotDichId,
    maKyThuat: r.maKyThuat,
    loaiKiemTra: r.loaiKiemTra,
    giaTriMacDinh: r.giaTriMacDinh ?? "",
    heSo: r.heSo !== undefined ? String(r.heSo) : "",
    moTa: r.moTa ?? "",
    batBuoc: r.batBuoc,
    isActive: r.isActive,
  };
}
