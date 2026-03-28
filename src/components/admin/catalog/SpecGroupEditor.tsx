"use client";

import { useState } from "react";
import { PlusIcon, LockClosedIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Alert } from "@/src/components/ui/Alert";
import { SpecTypeRow } from "./SpecTypeRow";
import type {
  EffectiveSpecGroup,
  SpecType,
  SpecTypeFormData,
} from "@/src/types/spec_group.types";

const MAX_DESCRIPTION_WORDS = 120;

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
  const [required, setRequired] = useState(false);
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
        required,
        displayOrder: nextOrder,
      });
      setName("");
      setDescription("");
      setRequired(false);
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

        <Textarea
          label="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn về thuộc tính này..."
          size="sm"
          rows={2}
          autoResize
          showWordCount
          maxWordCount={MAX_DESCRIPTION_WORDS}
        />

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
  const specTypes = localSpecTypes ?? group.specTypes;

  function handleMoveUp(id: string) {
    const idx = specTypes.findIndex((t) => t.id === id);
    if (idx <= 0) return;
    const newOrder = [...specTypes];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    onSpecTypesChange?.(newOrder);
    onReorderSpecTypes(group.id, newOrder.map((t) => t.id));
  }

  function handleMoveDown(id: string) {
    const idx = specTypes.findIndex((t) => t.id === id);
    if (idx < 0 || idx >= specTypes.length - 1) return;
    const newOrder = [...specTypes];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    onSpecTypesChange?.(newOrder);
    onReorderSpecTypes(group.id, newOrder.map((t) => t.id));
  }

  async function handleUpdateSpecType(id: string, data: Partial<SpecTypeFormData>) {
    await onUpdateSpecType(id, data);
  }

  async function handleDeleteSpecType(id: string) {
    await onDeleteSpecType(id);
    onSpecTypesChange?.(specTypes.filter((t) => t.id !== id));
  }

  async function handleAddSpecType(data: SpecTypeFormData) {
    const newType = await onAddSpecType(group.id, data);
    onSpecTypesChange?.([...specTypes, newType]);
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
            {specTypes.length} trường
          </Badge>
        </div>
        {group.description && (
          <p className="text-xs text-secondary-400 mt-1 line-clamp-2">{group.description}</p>
        )}
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

        {specTypes.length === 0 ? (
          <div className="py-6 flex flex-col items-center gap-2 text-secondary-400 text-sm">
            <p>Chưa có thuộc tính nào trong nhóm này.</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {specTypes.map((st, idx) => (
              <SpecTypeRow
                key={st.id}
                specType={st}
                index={idx}
                total={specTypes.length}
                readOnly={isInherited}
                onUpdate={handleUpdateSpecType}
                onDelete={handleDeleteSpecType}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ))}
          </ul>
        )}

        {!isInherited && (
          <AddSpecTypeForm
            groupId={group.id}
            nextOrder={specTypes.length}
            onAdd={handleAddSpecType}
          />
        )}
      </div>
    </div>
  );
}
