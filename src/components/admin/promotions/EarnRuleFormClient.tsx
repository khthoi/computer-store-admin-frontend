"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
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

type Props =
  | { mode: "create"; rule?: never }
  | { mode: "edit"; rule: LoyaltyEarnRule };

// ─── Select options ───────────────────────────────────────────────────────────

const BONUS_OPTIONS: SelectOption[] = [
  { value: "",            label: "None" },
  { value: "first_order", label: "First Order", description: "Bonus on customer's very first order" },
  { value: "birthday",    label: "Birthday",    description: "Bonus on customer's birthday month" },
  { value: "manual",      label: "Manual",      description: "Manually triggered by admin" },
];

const SCOPE_TYPE_OPTIONS: SelectOption[] = [
  { value: "category", label: "Category" },
  { value: "brand",    label: "Brand" },
];

// ─── Scope entry local type ────────────────────────────────────────────────────

interface ScopeEntry {
  scopeType: "category" | "brand";
  scopeRefLabel: string;
  multiplier: string;
}

function newScopeEntry(): ScopeEntry {
  return { scopeType: "category", scopeRefLabel: "", multiplier: "2" };
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-secondary-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-secondary-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EarnRuleFormClient({ mode, rule }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = mode === "edit";

  // ── Basic ──────────────────────────────────────────────────────────────────
  const [name, setName]               = useState(rule?.name ?? "");
  const [description, setDescription] = useState(rule?.description ?? "");
  const [isActive, setIsActive]       = useState(rule?.isActive ?? true);
  const [priority, setPriority]       = useState(rule?.priority != null ? String(rule.priority) : "10");

  // ── Points Rate ────────────────────────────────────────────────────────────
  const [pointsPerUnit, setPointsPerUnit]         = useState(rule?.pointsPerUnit != null ? String(rule.pointsPerUnit) : "1");
  const [spendPerUnit, setSpendPerUnit]           = useState(rule?.spendPerUnit != null ? String(rule.spendPerUnit) : "10000");
  const [minOrderValue, setMinOrderValue]         = useState(rule?.minOrderValue != null ? String(rule.minOrderValue) : "");
  const [maxPointsPerOrder, setMaxPointsPerOrder] = useState(rule?.maxPointsPerOrder != null ? String(rule.maxPointsPerOrder) : "");

  // ── Bonus ──────────────────────────────────────────────────────────────────
  const [bonusTrigger, setBonusTrigger] = useState<string>(rule?.bonusTrigger ?? "");
  const [bonusPoints, setBonusPoints]   = useState(rule?.bonusPoints != null ? String(rule.bonusPoints) : "");

  // ── Scope multipliers ──────────────────────────────────────────────────────
  const [scopes, setScopes] = useState<ScopeEntry[]>(
    rule?.scopes.map((s) => ({
      scopeType: s.scopeType,
      scopeRefLabel: s.scopeRefLabel,
      multiplier: String(s.multiplier),
    })) ?? []
  );

  // ── Validity ───────────────────────────────────────────────────────────────
  const [validFrom, setValidFrom]   = useState(rule?.validFrom ?? "");
  const [validUntil, setValidUntil] = useState(rule?.validUntil ?? "");

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
    if (priority === "" || isNaN(pri)) newErrors.priority = "Priority is required.";

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

      if (isEdit) {
        await updateEarnRule(rule.id, payload);
        showToast("Earn rule updated.", "success");
        router.push(`/promotions/earn-rules/${rule.id}`);
      } else {
        const created = await createEarnRule(payload);
        showToast("Earn rule created.", "success");
        router.push(`/promotions/earn-rules/${created.id}`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  }

  const backHref = isEdit ? `/promotions/earn-rules/${rule.id}` : "/promotions/earn-rules";

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <nav className="text-xs text-secondary-400 mb-0.5">
            <Link href="/promotions?tab=earn-rules" className="hover:text-secondary-600">Promos & Coupons</Link>
            {" / "}
            <Link href="/promotions/earn-rules" className="hover:text-secondary-600">Earn Rules</Link>
            {isEdit && (
              <>
                {" / "}
                <Link href={`/promotions/earn-rules/${rule.id}`} className="hover:text-secondary-600">
                  {rule.name}
                </Link>
              </>
            )}
          </nav>
          <h1 className="text-xl font-bold text-secondary-900">
            {isEdit ? `Edit: ${rule.name}` : "New Earn Rule"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── 1. Basic ──────────────────────────────────────────────────────── */}
        <Section title="Basic Info" description="Name, description and activation status for this rule.">
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
            placeholder="Optional — describe when this rule applies."
            rows={2}
            maxCharCount={300}
            showCharCount
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex items-center gap-8">
            <Toggle
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              label="Active"
            />
            <Input
              label="Priority"
              type="number"
              min={0}
              required
              placeholder="e.g. 10"
              helperText="Higher number = evaluated first when multiple rules apply."
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              errorMessage={errors.priority}
            />
          </div>
        </Section>

        {/* ── 2. Points Rate ────────────────────────────────────────────────── */}
        <Section
          title="Points Rate"
          description="How many points a customer earns per amount spent."
        >
          <div className="grid grid-cols-2 gap-4">
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
              helperText="e.g. 10000 → 1 pt per 10,000₫ spent"
              value={spendPerUnit}
              onChange={(e) => setSpendPerUnit(e.target.value)}
              errorMessage={errors.spendPerUnit}
              fullWidth
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min order value (VND)"
              type="number"
              min={0}
              placeholder="Blank = no minimum"
              helperText="Order must be at least this value to earn points."
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
              fullWidth
            />
            <Input
              label="Max points per order"
              type="number"
              min={1}
              placeholder="Blank = unlimited"
              helperText="Cap on points earned from a single order."
              value={maxPointsPerOrder}
              onChange={(e) => setMaxPointsPerOrder(e.target.value)}
              fullWidth
            />
          </div>

          {/* Live preview */}
          {pointsPerUnit && spendPerUnit && Number(pointsPerUnit) > 0 && Number(spendPerUnit) > 0 && (
            <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-sm text-primary-800">
              <span className="font-semibold">Preview: </span>
              Customer spending{" "}
              <span className="font-semibold">
                {(Number(spendPerUnit) * 10).toLocaleString("vi-VN")}₫
              </span>{" "}
              earns{" "}
              <span className="font-semibold">
                {(Number(pointsPerUnit) * 10).toLocaleString("vi-VN")} pts
              </span>
              {maxPointsPerOrder && Number(maxPointsPerOrder) > 0 && (
                <span className="text-primary-600">
                  {" "}(capped at {Number(maxPointsPerOrder).toLocaleString("vi-VN")} pts/order)
                </span>
              )}
              .
            </div>
          )}
        </Section>

        {/* ── 3. Bonus ──────────────────────────────────────────────────────── */}
        <Section
          title="Fixed Bonus"
          description="Award a one-time flat bonus when a specific event occurs."
        >
          <Select
            label="Bonus trigger"
            options={BONUS_OPTIONS}
            value={bonusTrigger}
            onChange={(v) => {
              setBonusTrigger(v as string);
              if (!v) setBonusPoints("");
            }}
            placeholder="None"
            helperText="Leave blank if this rule has no fixed bonus."
          />
          {bonusTrigger && (
            <Input
              label="Bonus points"
              type="number"
              min={1}
              required
              placeholder="e.g. 200"
              helperText="Number of bonus points awarded when the trigger fires."
              value={bonusPoints}
              onChange={(e) => setBonusPoints(e.target.value)}
              errorMessage={errors.bonusPoints}
              fullWidth
            />
          )}
        </Section>

        {/* ── 4. Scope Multipliers ──────────────────────────────────────────── */}
        <Section
          title="Scope Multipliers"
          description="Override the earn rate for specific categories or brands. Customers earn multiplier × base points when buying from these scopes."
        >
          {scopes.length > 0 && (
            <div className="space-y-3">
              {scopes.map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-secondary-200 bg-secondary-50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                      Scope #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setScopes((prev) => prev.filter((_, idx) => idx !== i))}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Select
                      label="Type"
                      options={SCOPE_TYPE_OPTIONS}
                      value={s.scopeType}
                      onChange={(v) => updateScope(i, "scopeType", v as string)}
                    />
                    <div className="col-span-2">
                      <Input
                        label="Name / Label"
                        placeholder="e.g. Linh kiện Gaming"
                        value={s.scopeRefLabel}
                        onChange={(e) => updateScope(i, "scopeRefLabel", e.target.value)}
                        errorMessage={errors[`scope_label_${i}`]}
                        fullWidth
                      />
                    </div>
                  </div>
                  <Input
                    label="Multiplier"
                    type="number"
                    min={0.1}
                    step={0.1}
                    placeholder="e.g. 2"
                    helperText="e.g. 2 = double points for purchases in this scope."
                    value={s.multiplier}
                    onChange={(e) => updateScope(i, "multiplier", e.target.value)}
                    errorMessage={errors[`scope_multiplier_${i}`]}
                    fullWidth
                  />
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setScopes((prev) => [...prev, newScopeEntry()])}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-secondary-300 bg-secondary-50 px-4 py-2.5 text-sm font-medium text-secondary-600 hover:border-primary-400 hover:text-primary-600 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Scope Multiplier
          </button>
        </Section>

        {/* ── 5. Validity ───────────────────────────────────────────────────── */}
        <Section
          title="Validity Period"
          description="Leave both fields blank to make the rule apply at all times."
        >
          <div className="grid grid-cols-2 gap-4">
            <DateInput label="Valid From" value={validFrom} onChange={setValidFrom} />
            <DateInput
              label="Valid Until"
              value={validUntil}
              onChange={setValidUntil}
              errorMessage={errors.validUntil}
            />
          </div>
        </Section>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href={backHref}
            className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
          >
            Cancel
          </Link>
          <Button type="submit" variant="primary" isLoading={saving} disabled={saving}>
            {isEdit ? "Save Changes" : "Create Earn Rule"}
          </Button>
        </div>
      </form>
    </div>
  );
}
