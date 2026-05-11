"use client";

// editor.css is imported here (not brought in by the dynamic RichTextEditor)
// because this component renders .rte-preview in view mode before the editor
// chunk is ever downloaded.
import "@/src/components/editor/styles/editor.css";
import { useState } from "react";
import dynamic from "next/dynamic";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { updateVariantDetail } from "@/src/services/product.service";

// ─── Dynamic import — CKEditor must be client-only ────────────────────────────

const RichTextEditor = dynamic(
  () =>
    import("@/src/components/editor").then((m) => ({ default: m.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse rounded-lg bg-secondary-100" />
    ),
  }
);

// ─── VariantDescriptionSection ────────────────────────────────────────────────
//
// Two modes:
//   Standalone (default) — no `onChange` prop: shows preview + Edit/Save/Cancel
//     buttons. Save is handled internally (mock until API is wired).
//   Controlled — `onChange` prop provided: renders the editor directly with no
//     internal Save button. The parent page owns the save action.

interface VariantDescriptionSectionProps {
  description: string;
  /** Required for standalone mode so the internal Save button can call the API. */
  productId?: string;
  variantId?: string;
  /**
   * When provided the component operates in controlled mode: the editor is
   * always visible, every change is forwarded to the parent, and the internal
   * Edit / Save / Cancel buttons are hidden.
   */
  onChange?: (value: string) => void;
}

export function VariantDescriptionSection({
  description,
  productId,
  variantId,
  onChange,
}: VariantDescriptionSectionProps) {
  const { showToast } = useToast();

  // ── Standalone-mode state (ignored when onChange is provided) ─────────────
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(description);
  const [saved, setSaved] = useState(description);
  const [isSaving, setIsSaving] = useState(false);

  // ── Controlled mode ───────────────────────────────────────────────────────

  if (onChange) {
    return (
      <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
          Mô tả phiên bản
        </h2>
        <RichTextEditor
          value={description}
          onChange={onChange}
          placeholder="Write the variant description…"
          minHeight={240}
        />
      </div>
    );
  }

  // ── Standalone mode ───────────────────────────────────────────────────────

  function handleEdit() {
    setDraft(saved);
    setIsEditing(true);
  }

  function handleCancel() {
    setDraft(saved);
    setIsEditing(false);
  }

  async function handleSave() {
    if (!productId || !variantId) return;
    setIsSaving(true);
    try {
      await updateVariantDetail(productId, variantId, { description: draft });
      setSaved(draft);
      setIsEditing(false);
      showToast("Mô tả đã được lưu.", "success");
    } catch {
      showToast("Lưu thất bại. Vui lòng thử lại.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      {/* Card header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary-500">
          Mô tả
        </h2>
        {!isEditing && productId && variantId && (
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-xs font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
          >
            <PencilSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </button>
        )}
      </div>

      {/* View mode */}
      {!isEditing && (
        <>
          {saved ? (
            <div
              className="rte-preview"
              dangerouslySetInnerHTML={{ __html: saved }}
            />
          ) : (
            <p className="text-sm text-secondary-400">No description added.</p>
          )}
        </>
      )}

      {/* Edit mode */}
      {isEditing && (
        <div className="space-y-3">
          <RichTextEditor
            value={draft}
            onChange={setDraft}
            placeholder="Write the variant description…"
            minHeight={240}
          />
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              Cancel
            </button>
            <Button
              type="button"
              variant="primary"
              isLoading={isSaving}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
