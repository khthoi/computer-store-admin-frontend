"use client";

import { useState, useRef } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  TruckIcon, ShieldCheckIcon, ArrowPathIcon, PhoneIcon,
  CreditCardIcon, GiftIcon, StarIcon, CheckBadgeIcon,
  ClockIcon, MapPinIcon, TagIcon, LockClosedIcon,
  PlusIcon, PencilIcon, TrashIcon, Bars3Icon,
  EyeIcon, EyeSlashIcon, CheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Toggle } from "@/src/components/ui/Toggle";
import { Modal } from "@/src/components/ui/Modal";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { useToast } from "@/src/components/ui/Toast";
import { saveTrustBadges } from "@/src/services/content.service";
import type { TrustBadge, TrustBadgeFormData, TrustBadgeIcon } from "@/src/types/content.types";

// ─── Icon registry ────────────────────────────────────────────────────────────

type IconComp = React.ComponentType<{ className?: string }>;

const ICON_MAP: Record<TrustBadgeIcon, IconComp> = {
  TruckIcon, ShieldCheckIcon, ArrowPathIcon, PhoneIcon,
  CreditCardIcon, GiftIcon, StarIcon, CheckBadgeIcon,
  ClockIcon, MapPinIcon, TagIcon, LockClosedIcon,
};

const ICON_LIST: { key: TrustBadgeIcon; label: string }[] = [
  { key: "TruckIcon",       label: "Giao hàng" },
  { key: "ShieldCheckIcon", label: "Bảo hành" },
  { key: "ArrowPathIcon",   label: "Đổi trả" },
  { key: "PhoneIcon",       label: "Hỗ trợ" },
  { key: "CreditCardIcon",  label: "Thanh toán" },
  { key: "GiftIcon",        label: "Ưu đãi" },
  { key: "StarIcon",        label: "Nổi bật" },
  { key: "CheckBadgeIcon",  label: "Xác nhận" },
  { key: "ClockIcon",       label: "Thời gian" },
  { key: "MapPinIcon",      label: "Địa điểm" },
  { key: "TagIcon",         label: "Giảm giá" },
  { key: "LockClosedIcon",  label: "An toàn" },
];

function BadgeIcon({ icon, className }: { icon: TrustBadgeIcon; className?: string }) {
  const Comp = ICON_MAP[icon];
  return <Comp className={className} />;
}

// ─── Default form values ──────────────────────────────────────────────────────

const DEFAULT_FORM: TrustBadgeFormData = {
  icon: "TruckIcon",
  title: "",
  subtitle: "",
  active: true,
  sortOrder: 0,
};

// ─── Badge Form Modal ─────────────────────────────────────────────────────────

function BadgeFormModal({
  badge,
  onClose,
  onSave,
}: {
  badge: TrustBadge | null;
  onClose: () => void;
  onSave: (data: TrustBadgeFormData) => void;
}) {
  const [form, setForm] = useState<TrustBadgeFormData>(
    badge
      ? { icon: badge.icon, title: badge.title, subtitle: badge.subtitle ?? "", active: badge.active, sortOrder: badge.sortOrder }
      : DEFAULT_FORM
  );

  function set<K extends keyof TrustBadgeFormData>(k: K, v: TrustBadgeFormData[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const IconPreview = ICON_MAP[form.icon];

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>Hủy</Button>
      <Button
        variant="primary"
        onClick={() => onSave(form)}
        disabled={!form.title.trim()}
      >
        {badge ? "Cập nhật" : "Thêm badge"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={badge ? "Sửa trust badge" : "Thêm trust badge"}
      size="md"
      footer={footer}
      animated
    >
      <div className="flex flex-col gap-5">
        {/* Icon picker */}
        <div>
          <p className="mb-2 text-sm font-medium text-secondary-700">Icon</p>
          <div className="grid grid-cols-6 gap-1.5">
            {ICON_LIST.map(({ key, label }) => {
              const Ic = ICON_MAP[key];
              const active = form.icon === key;
              return (
                <Tooltip key={key} content={label} placement="top">
                  <button
                    type="button"
                    onClick={() => set("icon", key)}
                    className={[
                      "flex flex-col items-center gap-1 rounded-lg border p-2 transition-all",
                      active
                        ? "border-primary-400 bg-primary-50 text-primary-600"
                        : "border-secondary-200 text-secondary-500 hover:border-secondary-300 hover:bg-secondary-50",
                    ].join(" ")}
                  >
                    <Ic className="h-5 w-5" />
                    {active && <CheckIcon className="h-3 w-3 text-primary-500" />}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
            <IconPreview className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-secondary-800">
              {form.title || <span className="italic text-secondary-400">Tiêu đề badge</span>}
            </p>
            {form.subtitle && (
              <p className="text-xs text-secondary-500">{form.subtitle}</p>
            )}
          </div>
        </div>

        <Input
          label="Tiêu đề"
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="VD: Miễn phí giao hàng"
        />

        <Input
          label="Phụ đề"
          value={form.subtitle ?? ""}
          onChange={(e) => set("subtitle", e.target.value)}
          placeholder="VD: Đơn từ 500.000đ trở lên"
          helperText="Tuỳ chọn — dòng nhỏ bên dưới tiêu đề"
        />

        <Toggle
          label="Hiển thị"
          checked={form.active}
          onChange={(e) => set("active", e.target.checked)}
        />
      </div>
    </Modal>
  );
}

// ─── Sortable badge row ───────────────────────────────────────────────────────

function SortableBadgeRow({
  badge,
  index,
  onToggle,
  onEdit,
  onDelete,
  onDragEnd,
}: {
  badge: TrustBadge;
  index: number;
  onToggle: (id: string) => void;
  onEdit: (b: TrustBadge) => void;
  onDelete: (b: TrustBadge) => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  return (
    <Reorder.Item
      value={badge}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => { setIsDragging(false); onDragEnd(); }}
      style={{ userSelect: "none", zIndex: isDragging ? 50 : "auto", position: "relative" }}
      animate={isDragging
        ? { scale: 1.015, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }
        : { scale: 1,     boxShadow: "0 0px 0px rgba(0,0,0,0.00)" }
      }
      className={[
        "group flex cursor-default items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
        badge.active
          ? "border-secondary-200 bg-white hover:border-secondary-300"
          : "border-secondary-100 bg-secondary-50 opacity-60",
      ].join(" ")}
    >
      {/* Drag handle */}
      <span
        className="shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing"
        onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
      >
        <Bars3Icon className="h-4 w-4" />
      </span>

      {/* Order badge */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-[11px] font-bold text-secondary-500">
        {index}
      </span>

      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50">
        <BadgeIcon icon={badge.icon} className="h-5 w-5 text-primary-600" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="select-none text-sm font-semibold text-secondary-800 truncate">{badge.title}</p>
        {badge.subtitle && (
          <p className="select-none text-xs text-secondary-500 truncate">{badge.subtitle}</p>
        )}
      </div>

      {/* Active toggle */}
      <button type="button" onClick={() => onToggle(badge.id)}
        className="shrink-0 text-secondary-400 hover:text-secondary-600 transition-colors">
        {badge.active ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
      </button>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Tooltip content="Chỉnh sửa" placement="top">
          <Button variant="ghost" size="xs" onClick={() => onEdit(badge)}>
            <PencilIcon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <Tooltip content="Xóa" placement="top">
          <Button variant="ghost" size="xs" className="text-error-500 hover:bg-error-50"
            onClick={() => onDelete(badge)}>
            <TrashIcon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      </div>
    </Reorder.Item>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TrustBadgeEditor({
  initialBadges,
}: {
  initialBadges: TrustBadge[];
}) {
  const { showToast } = useToast();
  const [badges, setBadges] = useState<TrustBadge[]>(
    [...initialBadges].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const badgesRef = useRef(badges);
  // keep ref fresh so drag-end closure reads latest order
  const syncRef = (next: TrustBadge[]) => { setBadges(next); badgesRef.current = next; };

  const [formTarget, setFormTarget] = useState<TrustBadge | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrustBadge | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  function markDirty() { setIsDirty(true); }

  function handleReorder(newOrder: TrustBadge[]) {
    syncRef(newOrder);
    markDirty();
  }

  function handleDragEnd() {
    // sortOrder is re-assigned on save; nothing extra needed here
  }

  function handleSaved(data: TrustBadgeFormData) {
    if (formTarget === "new") {
      const newBadge: TrustBadge = { id: `tb-${Date.now()}`, ...data, sortOrder: badges.length + 1 };
      syncRef([...badges, newBadge]);
    } else if (formTarget) {
      syncRef(badges.map((b) => (b.id === formTarget.id ? { ...formTarget, ...data } : b)));
    }
    setFormTarget(null);
    markDirty();
  }

  function handleToggleActive(id: string) {
    syncRef(badges.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
    markDirty();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    syncRef(badges.filter((b) => b.id !== deleteTarget.id));
    setDeleteTarget(null);
    markDirty();
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const formData: TrustBadgeFormData[] = badges.map((b, idx) => ({
        icon: b.icon,
        title: b.title,
        subtitle: b.subtitle,
        active: b.active,
        sortOrder: idx + 1,
      }));
      await saveTrustBadges(formData);
      setIsDirty(false);
      showToast("Đã lưu trust badges", "success");
    } catch {
      showToast("Lưu thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-secondary-400">{badges.length} badge</p>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
            >
              Lưu thay đổi
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<PlusIcon className="h-4 w-4" />}
            onClick={() => setFormTarget("new")}
          >
            Thêm badge
          </Button>
        </div>
      </div>

      {/* Sortable list */}
      {badges.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-secondary-200 py-10">
          <p className="text-sm text-secondary-400">Chưa có badge nào.</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={badges}
          onReorder={handleReorder}
          as="div"
          className="flex flex-col gap-2"
          style={{ touchAction: "none" }}
        >
          {badges.map((badge, idx) => (
            <SortableBadgeRow
              key={badge.id}
              badge={badge}
              index={idx + 1}
              onToggle={handleToggleActive}
              onEdit={(b) => setFormTarget(b)}
              onDelete={(b) => setDeleteTarget(b)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </Reorder.Group>
      )}

      {/* Strip preview */}
      {badges.filter((b) => b.active).length > 0 && (
        <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-secondary-400">
            Xem trước trên storefront
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {badges.filter((b) => b.active).map((badge) => (
              <div key={badge.id} className="flex flex-col items-center gap-1.5 rounded-lg bg-white p-3 text-center shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                  <BadgeIcon icon={badge.icon} className="h-5 w-5 text-primary-600" />
                </div>
                <p className="text-xs font-semibold text-secondary-800 leading-tight">{badge.title}</p>
                {badge.subtitle && (
                  <p className="text-[10px] text-secondary-500 leading-tight">{badge.subtitle}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form modal */}
      {formTarget !== null && (
        <BadgeFormModal
          badge={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSave={handleSaved}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa badge"
        description={`Xóa badge "${deleteTarget?.title}"?`}
        confirmLabel="Xóa"
        variant="danger"
      />
    </div>
  );
}

// Re-export icon map so other components can use it
export { ICON_MAP as TRUST_BADGE_ICON_MAP };
export type { IconComp as TrustBadgeIconComp };
