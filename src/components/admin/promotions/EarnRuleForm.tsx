"use client";

import { useState } from "react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import type {
  LoyaltyEarnRule,
  LoyaltyEarnRulePayload,
  EarnRuleBonusTrigger,
} from "@/src/types/loyalty.types";
import type { SelectOption } from "@/src/components/ui/Select";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Toggle } from "@/src/components/ui/Toggle";
import { DateInput } from "@/src/components/ui/DateInput";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { createEarnRule, updateEarnRule } from "@/src/services/loyalty.service";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  item?: LoyaltyEarnRule;
  onClose: () => void;
  onSaved: (saved: LoyaltyEarnRule) => void;
}

// ─── Select options ───────────────────────────────────────────────────────────

const BONUS_OPTIONS: SelectOption[] = [
  { value: "",             label: "None" },
  { value: "first_order",  label: "First Order", description: "Bonus on customer's very first order" },
  { value: "birthday",     label: "Birthday",    description: "Bonus on customer's birthday month" },
  { value: "manual",       label: "Manual",      description: "Manually triggered by admin" },
];

const SCOPE_TYPE_OPTIONS: SelectOption[] = [
  { value: "category", label: "Category" },
  { value: "brand",    label: "Brand" },
];

// ─── Scope entry local type ────────────────────────────────────────────────────

interface ScopeEntry {
  scopeType: "category" | "brand";
  scopeRefId: string;
  scopeRefLabel: string;
  multiplier: string; // keep as string while editing
}

function newScopeEntry(): ScopeEntry {
  return { scopeType: "category", scopeRefId: "", scopeRefLabel: "", multiplier: "2" };
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 mt-2 mb-1">
      {children}
    </p>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EarnRuleForm({ item, onClose, onSaved }: Props) {
  const { showToast } = useToast();
  const isEdit = !!item;

  // ── Basic ──────────────────────────────────────────────────────────────────
  const [name, setName]               = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [isActive, setIsActive]       = useState(item?.isActive ?? true);
  const [priority, setPriority]       = useState(item?.priority != null ? String(item.priority) : "10");

  // ── Points Rate ────────────────────────────────────────────────────────────
  const [pointsPerUnit, setPointsPerUnit]       = useState(item?.pointsPerUnit != null ? String(item.pointsPerUnit) : "1");
  const [spendPerUnit, setSpendPerUnit]         = useState(item?.spendPerUnit != null ? String(item.spendPerUnit) : "10000");
  const [minOrderValue, setMinOrderValue]       = useState(item?.minOrderValue != null ? String(item.minOrderValue) : "");
  const [maxPointsPerOrder, setMaxPointsPerOrder] = useState(item?.maxPointsPerOrder != null ? String(item.maxPointsPerOrder) : "");

  // ── Bonus ──────────────────────────────────────────────────────────────────
  const [bonusTrigger, setBonusTrigger] = useState<string>(item?.bonusTrigger ?? "");
  const [bonusPoints, setBonusPoints]   = useState(item?.bonusPoints != null ? String(item.bonusPoints) : "");

  // ── Scope multipliers ──────────────────────────────────────────────────────
  const [scopes, setScopes] = useState<ScopeEntry[]>(
    item?.scopes.map((s) => ({
      scopeType: s.scopeType,
      scopeRefId: s.scopeRefId,
      scopeRefLabel: s.scopeRefLabel,
      multiplier: String(s.multiplier),
    })) ?? []
  );

  // ── Validity ───────────────────────────────────────────────────────────────
  const [validFrom, setValidFrom]   = useState(item?.validFrom ?? "");
  const [validUntil, setValidUntil] = useState(item?.validUntil ?? "");

  // ── Validation ─────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // ── Scope helpers ──────────────────────────────────────────────────────────
  function updateScope(index: number, field: keyof ScopeEntry, value: string) {
    setScopes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function removeScope(index: number) {
    setScopes((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required.";

    const ppu = Number(pointsPerUnit);
    if (!pointsPerUnit || isNaN(ppu) || ppu <= 0)
      newErrors.pointsPerUnit = "Must be greater than 0.";

    const spu = Number(spendPerUnit);
    if (!spendPerUnit || isNaN(spu) || spu <= 0)
      newErrors.spendPerUnit = "Must be greater than 0.";

    const pri = Number(priority);
    if (!priority || isNaN(pri)) newErrors.priority = "Priority is required.";

    if (bonusTrigger && (!bonusPoints || isNaN(Number(bonusPoints)) || Number(bonusPoints) <= 0))
      newErrors.bonusPoints = "Bonus points must be greater than 0 when a trigger is set.";

    if (validFrom && validUntil && validUntil <= validFrom)
      newErrors.validUntil = "Valid Until must be after Valid From.";

    scopes.forEach((s, i) => {
      if (!s.scopeRefLabel.trim())
        newErrors[`scope_label_${i}`] = "Label is required.";
      const m = Number(s.multiplier);
      if (isNaN(m) || m <= 0)
        newErrors[`scope_multiplier_${i}`] = "Multiplier must be > 0.";
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      const payload: LoyaltyEarnRulePayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        pointsPerUnit: ppu,
        spendPerUnit: spu,
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        maxPointsPerOrder: maxPointsPerOrder ? Number(maxPointsPerOrder) : undefined,
        bonusTrigger: bonusTrigger ? (bonusTrigger as EarnRuleBonusTrigger) : undefined,
        bonusPoints: bonusTrigger && bonusPoints ? Number(bonusPoints) : undefined,
        scopes: scopes.map((s) => ({
          scopeType: s.scopeType,
          scopeRefId: s.scopeRefLabel.trim().toLowerCase().replace(/\s+/g, "-"),
          scopeRefLabel: s.scopeRefLabel.trim(),
          multiplier: Number(s.multiplier),
        })),
        isActive,
        priority: pri,
        validFrom: validFrom || undefined,
        validUntil: validUntil || undefined,
      };

      const result = isEdit
        ? await updateEarnRule(item!.id, payload)
        : await createEarnRule(payload);

      showToast(isEdit ? "Earn rule updated." : "Earn rule created.", "success");
      onSaved(result);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-w-xl w-full bg-white rounded-2xl p-6 shadow-xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-secondary-900">
            {isEdit ? "Edit Earn Rule" : "New Earn Rule"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Basic ────────────────────────────────────────────────────── */}
          <SectionHeading>Basic</SectionHeading>

          <Input
            label="Name"
            required
            placeholder="e.g. Base Rate"
            value={name}
            onChange={(e) => setName(e.target.value)}
            errorMessage={errors.name}
            fullWidth
          />

          <Textarea
            label="Description"
            placeholder="Optional description…"
            rows={2}
            maxCharCount={300}
            showCharCount
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 py-1">
              <Toggle
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                label="Active"
              />
            </div>
            <Input
              label="Priority"
              type="number"
              min={0}
              required
              placeholder="e.g. 10"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              errorMessage={errors.priority}
              fullWidth
            />
          </div>

          {/* ── Points Rate ───────────────────────────────────────────────── */}
          <SectionHeading>Points Rate</SectionHeading>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Points awarded"
              type="number"
              min={1}
              required
              placeholder="e.g. 1"
              value={pointsPerUnit}
              onChange={(e) => setPointsPerUnit(e.target.value)}
              errorMessage={errors.pointsPerUnit}
              fullWidth
            />
            <Input
              label="Per (VND)"
              type="number"
              min={1}
              required
              placeholder="e.g. 10000"
              helperText="e.g. 10000 = 1 pt per 10k VND"
              value={spendPerUnit}
              onChange={(e) => setSpendPerUnit(e.target.value)}
              errorMessage={errors.spendPerUnit}
              fullWidth
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min order value (VND)"
              type="number"
              min={0}
              placeholder="Blank = no minimum"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
              fullWidth
            />
            <Input
              label="Max points per order"
              type="number"
              min={1}
              placeholder="Blank = unlimited"
              value={maxPointsPerOrder}
              onChange={(e) => setMaxPointsPerOrder(e.target.value)}
              fullWidth
            />
          </div>

          {/* ── Bonus ─────────────────────────────────────────────────────── */}
          <SectionHeading>Bonus</SectionHeading>

          <Select
            label="Bonus trigger"
            options={BONUS_OPTIONS}
            value={bonusTrigger}
            onChange={(v) => {
              setBonusTrigger(v as string);
              if (!v) setBonusPoints("");
            }}
            placeholder="None"
          />

          {bonusTrigger && (
            <Input
              label="Bonus points"
              type="number"
              min={1}
              required
              placeholder="e.g. 200"
              value={bonusPoints}
              onChange={(e) => setBonusPoints(e.target.value)}
              errorMessage={errors.bonusPoints}
              fullWidth
            />
          )}

          {/* ── Scope Multipliers ─────────────────────────────────────────── */}
          <SectionHeading>Scope Multipliers</SectionHeading>

          <p className="text-xs text-secondary-500 -mt-2">
            Add category or brand overrides. Customers earn more points when buying from these scopes.
          </p>

          {scopes.length > 0 && (
            <div className="space-y-3">
              {scopes.map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-secondary-200 bg-secondary-50 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-secondary-500">
                      Scope #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeScope(i)}
                      className="text-secondary-400 hover:text-error-600 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      label="Type"
                      options={SCOPE_TYPE_OPTIONS}
                      value={s.scopeType}
                      onChange={(v) => updateScope(i, "scopeType", v as string)}
                      size="sm"
                    />
                    <div className="col-span-2">
                      <Input
                        label="Label"
                        placeholder="e.g. Linh kiện Gaming"
                        value={s.scopeRefLabel}
                        onChange={(e) => updateScope(i, "scopeRefLabel", e.target.value)}
                        errorMessage={errors[`scope_label_${i}`]}
                        fullWidth
                        size="sm"
                      />
                    </div>
                  </div>
                  <Input
                    label="Multiplier (e.g. 2 = 2× points)"
                    type="number"
                    min={0.1}
                    step={0.1}
                    placeholder="e.g. 2"
                    value={s.multiplier}
                    onChange={(e) => updateScope(i, "multiplier", e.target.value)}
                    errorMessage={errors[`scope_multiplier_${i}`]}
                    fullWidth
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setScopes((prev) => [...prev, newScopeEntry()])}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Scope
          </button>

          {/* ── Validity ──────────────────────────────────────────────────── */}
          <SectionHeading>Validity</SectionHeading>

          <div className="grid grid-cols-2 gap-3">
            <DateInput
              label="Valid From"
              value={validFrom}
              onChange={setValidFrom}
            />
            <DateInput
              label="Valid Until"
              value={validUntil}
              onChange={setValidUntil}
              errorMessage={errors.validUntil}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving} disabled={saving}>
              {isEdit ? "Save Changes" : "Create Rule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
