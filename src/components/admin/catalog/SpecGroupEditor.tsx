"use client";

import { useState, useEffect } from "react";
import { Reorder } from "framer-motion";
import {
  PlusIcon,
  LockClosedIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Toggle } from "@/src/components/ui/Toggle";
import { Select, type SelectOption } from "@/src/components/ui/Select";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Alert } from "@/src/components/ui/Alert";
import { SpecTypeRow } from "./SpecTypeRow";
import type {
  EffectiveSpecGroup,
  SpecType,
  SpecTypeFormData,
  SpecDataType,
  FilterWidget,
} from "@/src/types/spec_group.types";

const MAX_DESCRIPTION_WORDS = 120;

const DATA_TYPE_OPTIONS: SelectOption[] = [
  { value: "text", label: "Văn bản" },
  { value: "number", label: "Số" },
  { value: "enum", label: "Danh sách chọn" },
  { value: "boolean", label: "Có / Không" },
];

const WIDGET_OPTIONS: SelectOption[] = [
  { value: "checkbox", label: "Checkbox (chọn nhiều)" },
  { value: "range", label: "Range slider (khoảng số)" },
  { value: "toggle", label: "Toggle (bật/tắt)" },
  { value: "select", label: "Select (chọn một)" },
  { value: "combo-select", label: "Combo-select (kết hợp)" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SpecGroupEditorProps {
  group: EffectiveSpecGroup;
  onUpdateGroup: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  onAddSpecType: (groupId: string, data: SpecTypeFormData) => Promise<SpecType>;
  onUpdateSpecType: (id: string, data: Partial<SpecTypeFormData>) => Promise<void>;
  onDeleteSpecType: (id: string) => Promise<void>;
  onReorderSpecTypes: (groupId: string, orderedIds: string[]) => Promise<void>;
  localSpecTypes?: SpecType[];
  onSpecTypesChange?: (types: SpecType[]) => void;
  /** Called when user clicks the source-category link in the inherited-group header */
  onNavigateToCategory?: (categoryId: string) => void;
}

// ─── Add spec type form ───────────────────────────────────────────────────────

interface AddSpecTypeFormProps {
  groupId: string;
  nextOrder: number;
  onAdd: (data: SpecTypeFormData) => Promise<void>;
}

function AddSpecTypeForm({ groupId: _groupId, nextOrder, onAdd }: AddSpecTypeFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maKyThuat, setMaKyThuat] = useState("");
  const [required, setRequired] = useState(false);
  const [kieuDuLieu, setKieuDuLieu] = useState<SpecDataType>("text");
  const [donVi, setDonVi] = useState("");
  const [coTheLoc, setCoTheLoc] = useState(false);
  const [widgetLoc, setWidgetLoc] = useState<FilterWidget | "">("");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  async function handleAdd() {
    if (!name.trim()) {
      setNameError("Tên thuộc tính là bắt buộc");
      return;
    }
    setSaving(true);
    try {
      await onAdd({
        name: name.trim(),
        description: description.trim(),
        maKyThuat: maKyThuat.trim(),
        required,
        displayOrder: nextOrder,
        kieuDuLieu,
        donVi: donVi.trim(),
        coTheLoc,
        widgetLoc: coTheLoc ? (widgetLoc as FilterWidget) || "checkbox" : "",
        thuTuLoc: coTheLoc ? nextOrder : 0,
      });
      setName("");
      setDescription("");
      setMaKyThuat("");
      setRequired(false);
      setKieuDuLieu("text");
      setDonVi("");
      setCoTheLoc(false);
      setWidgetLoc("");
      setNameError("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 p-3 rounded-lg border border-dashed border-secondary-200 bg-secondary-50">
      <p className="text-xs font-semibold text-secondary-500 mb-2 uppercase tracking-wide">
        Thêm thuộc tính mới
      </p>
      <div className="flex flex-col gap-2">
        <Input
          label="Tên"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setNameError("");
          }}
          placeholder="VD: Dung lượng RAM"
          size="sm"
          required
          errorMessage={nameError || undefined}
        />

        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              label="Kiểu dữ liệu"
              options={DATA_TYPE_OPTIONS}
              value={kieuDuLieu}
              onChange={(val) => {
                const v = val as SpecDataType;
                setKieuDuLieu(v);
                if (v !== "number") setDonVi("");
                if (v === "boolean") setWidgetLoc("toggle");
              }}
              size="sm"
            />
          </div>
          {kieuDuLieu === "number" && (
            <div className="w-28">
              <Input
                label="Đơn vị"
                value={donVi}
                onChange={(e) => setDonVi(e.target.value)}
                placeholder="GHz, W, GB…"
                size="sm"
              />
            </div>
          )}
        </div>

        <Input
          label="Mã kỹ thuật"
          value={maKyThuat}
          onChange={(e) =>
            setMaKyThuat(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
          }
          placeholder="VD: cpu_socket, tdp_watt, ram_type…"
          size="sm"
          helperText="Dùng cho engine kiểm tra tương thích Build PC — để trống nếu không cần"
        />

        <Textarea
          label="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn về thuộc tính này..."
          size="sm"
          rows={2}
          autoResize
          showCharCount
          maxCharCount={MAX_DESCRIPTION_WORDS}
        />

        {/* Cấu hình bộ lọc */}
        <div className="rounded-md border border-secondary-200 bg-white px-3 py-2.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary-700 flex items-center gap-1.5">
              <FunnelIcon className="w-3.5 h-3.5" />
              Bộ lọc sản phẩm
            </span>
            <Toggle
              checked={coTheLoc}
              onChange={(e) => {
                setCoTheLoc(e.target.checked);
                if (!e.target.checked) {
                  setWidgetLoc("");
                } else if (!widgetLoc) {
                  setWidgetLoc(
                    kieuDuLieu === "number"
                      ? "range"
                      : kieuDuLieu === "boolean"
                      ? "toggle"
                      : "checkbox"
                  );
                }
              }}
              label="Dùng làm facet filter"
              size="sm"
            />
          </div>
          {coTheLoc && (
            <Select
              label="Dạng widget"
              options={WIDGET_OPTIONS}
              value={widgetLoc}
              onChange={(val) => setWidgetLoc(val as FilterWidget)}
              placeholder="— Chọn widget —"
              size="sm"
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <Checkbox
            label="Bắt buộc"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleAdd}
            disabled={saving}
          >
            <PlusIcon className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            {saving ? "Đang thêm..." : "Thêm thuộc tính"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SpecGroupEditor({
  group,
  onUpdateGroup: _onUpdateGroup,
  onAddSpecType,
  onUpdateSpecType,
  onDeleteSpecType,
  onReorderSpecTypes,
  localSpecTypes,
  onSpecTypesChange,
  onNavigateToCategory,
}: SpecGroupEditorProps) {
  const isInherited = group.isInherited;
  const sourceSpecTypes = localSpecTypes ?? group.specTypes;

  const [dragOrder, setDragOrder] = useState<SpecType[]>(sourceSpecTypes);
  const [isDirty, setIsDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (!isDirty) {
      setDragOrder(sourceSpecTypes);
    }
  }, [sourceSpecTypes, isDirty]);

  function handleDragReorder(newOrder: SpecType[]) {
    setDragOrder(newOrder);
    setIsDirty(true);
    onSpecTypesChange?.(newOrder);
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    try {
      await onReorderSpecTypes(group.id, dragOrder.map((t) => t.id));
      setIsDirty(false);
    } finally {
      setSavingOrder(false);
    }
  }

  async function handleUpdateSpecType(id: string, data: Partial<SpecTypeFormData>) {
    await onUpdateSpecType(id, data);
  }

  async function handleDeleteSpecType(id: string) {
    await onDeleteSpecType(id);
    const next = dragOrder.filter((t) => t.id !== id);
    setDragOrder(next);
    onSpecTypesChange?.(next);
  }

  async function handleAddSpecType(data: SpecTypeFormData) {
    const newType = await onAddSpecType(group.id, data);
    const next = [...dragOrder, newType];
    setDragOrder(next);
    onSpecTypesChange?.(next);
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-secondary-100 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {isInherited && (
            <LockClosedIcon
              className="w-4 h-4 shrink-0 text-secondary-400"
              aria-label="Nhóm kế thừa"
            />
          )}
          <h2 className="text-sm font-semibold text-secondary-900 truncate flex-1">
            {group.name}
          </h2>
          <Badge variant="default" size="sm" className="shrink-0">
            {dragOrder.length} trường
          </Badge>
        </div>
        {group.description && (
          <p className="text-xs text-secondary-400 mt-1 line-clamp-2">{group.description}</p>
        )}
        {isInherited && (() => {
          const filterableCount = dragOrder.filter((t) => t.coTheLoc).length;
          return filterableCount > 0 ? (
            <p className="text-xs text-secondary-400 mt-1 flex items-center gap-1">
              <FunnelIcon className="w-3 h-3 text-success-500 shrink-0" aria-hidden="true" />
              {filterableCount}/{dragOrder.length} thuộc tính dùng làm bộ lọc
            </p>
          ) : null;
        })()}
        {isInherited && (
          <p className="text-xs text-secondary-400 mt-1">
            Kế thừa từ:{" "}
            {onNavigateToCategory ? (
              <button
                type="button"
                onClick={() => onNavigateToCategory(group.sourceCategoryId)}
                className="inline-flex items-center gap-0.5 font-medium text-primary-600 hover:text-primary-700 hover:underline cursor-pointer transition-colors"
              >
                {group.sourceCategoryName}
                <ArrowTopRightOnSquareIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
              </button>
            ) : (
              <span className="font-medium text-secondary-600">{group.sourceCategoryName}</span>
            )}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {isInherited && (
          <Alert variant="info" className="mb-3 text-xs">
            Nhóm này được kế thừa — không thể thêm, sửa hoặc xóa thuộc tính từ đây.
            Để chỉnh sửa, hãy vào danh mục nguồn.
          </Alert>
        )}

        {dragOrder.length === 0 ? (
          <div className="py-6 flex flex-col items-center gap-2 text-secondary-400 text-sm">
            <p>Chưa có thuộc tính nào trong nhóm này.</p>
          </div>
        ) : (
          <>
            <Reorder.Group
              as="ul"
              axis="y"
              values={dragOrder}
              onReorder={handleDragReorder}
              className="space-y-0.5"
            >
              {dragOrder.map((st) => (
                <SpecTypeRow
                  key={st.id}
                  specType={st}
                  readOnly={isInherited}
                  onUpdate={handleUpdateSpecType}
                  onDelete={handleDeleteSpecType}
                />
              ))}
            </Reorder.Group>

            {!isInherited && isDirty && (
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveOrder}
                  disabled={savingOrder}
                >
                  {savingOrder ? "Đang lưu..." : "Lưu thứ tự"}
                </Button>
              </div>
            )}
          </>
        )}

        {!isInherited && (
          <AddSpecTypeForm
            groupId={group.id}
            nextOrder={dragOrder.length}
            onAdd={handleAddSpecType}
          />
        )}
      </div>
    </div>
  );
}
