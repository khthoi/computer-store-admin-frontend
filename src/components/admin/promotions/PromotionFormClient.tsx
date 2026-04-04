"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { DateInput } from "@/src/components/ui/DateInput";
import { Toggle } from "@/src/components/ui/Toggle";
import { useToast } from "@/src/components/ui/Toast";
import {
  createPromotion,
  updatePromotion,
  generateCouponCode,
} from "@/src/services/promotion.service";
import {
  ConditionBuilder,
  conditionDraftToPayload,
  conditionToEditDraft,
  type ConditionDraft,
} from "./ConditionBuilder";
import {
  ScopeSelector,
  scopeDraftToPayload,
  scopeToEditDraft,
  type ScopeDraft,
} from "./ScopeSelector";
import { BxgyActionForm, defaultBxgyFields } from "./BxgyActionForm";
import { BundleActionForm } from "./BundleActionForm";
import { BulkTiersForm } from "./BulkTiersForm";
import { formatVND } from "@/src/lib/format";
import type {
  Promotion,
  PromotionType,
  PromotionStatus,
  StackingPolicy,
  DiscountType,
  ApplicationLevel,
  BxgyFields,
  BundleComponent,
  BulkTier,
  PromotionFormPayload,
} from "@/src/types/promotion.types";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props =
  | { mode: "create"; promotion?: never }
  | { mode: "edit"; promotion: Promotion };

// ─── Section card wrapper ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-secondary-900">{title}</h2>
      {children}
    </div>
  );
}

// ─── Form component ───────────────────────────────────────────────────────────

export function PromotionFormClient({ mode, promotion }: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  // ── Section 1: Basic Info ──────────────────────────────────────────────────
  const [name, setName] = useState(promotion?.name ?? "");
  const [description, setDescription] = useState(promotion?.description ?? "");
  const [type, setType] = useState<PromotionType>(promotion?.type ?? "standard");
  const [isCoupon, setIsCoupon] = useState(promotion?.isCoupon ?? false);
  const [code, setCode] = useState(promotion?.code ?? "");
  const [priority, setPriority] = useState(promotion?.priority ?? 0);
  const [stackingPolicy, setStackingPolicy] = useState<StackingPolicy>(
    promotion?.stackingPolicy ?? "stackable"
  );

  // ── Section 2: Scope ───────────────────────────────────────────────────────
  const [scopes, setScopes] = useState<ScopeDraft[]>(
    promotion?.scopes.map(scopeToEditDraft) ?? [
      { draftId: "scope-default", scopeType: "global" },
    ]
  );

  // ── Section 3: Conditions ──────────────────────────────────────────────────
  const [conditions, setConditions] = useState<ConditionDraft[]>(
    promotion?.conditions.map(conditionToEditDraft) ?? []
  );

  // ── Section 4: Action ─────────────────────────────────────────────────────
  const initialAction = promotion?.actions[0];

  const [discountType, setDiscountType] = useState<DiscountType>(
    initialAction?.discountType ?? "percentage"
  );
  const [discountValue, setDiscountValue] = useState(
    initialAction?.discountValue?.toString() ?? ""
  );
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(
    initialAction?.maxDiscountAmount?.toString() ?? ""
  );
  const [appLevel, setAppLevel] = useState<ApplicationLevel>(
    initialAction?.applicationLevel ?? "cart_total"
  );

  // BXGY state
  const [bxgy, setBxgy] = useState<BxgyFields>(
    initialAction?.bxgy ?? defaultBxgyFields()
  );

  // Bundle state
  const [bundleComponents, setBundleComponents] = useState<BundleComponent[]>(
    initialAction?.requiredComponents ?? []
  );

  // Bulk tiers state
  const [tiers, setTiers] = useState<BulkTier[]>(
    initialAction?.tiers ?? []
  );

  // ── Section 5: Validity & Limits ──────────────────────────────────────────
  const [startDate, setStartDate] = useState(promotion?.startDate ?? "");
  const [endDate, setEndDate] = useState(promotion?.endDate ?? "");
  const [totalUsageLimit, setTotalUsageLimit] = useState(
    promotion?.totalUsageLimit?.toString() ?? ""
  );
  const [perCustomerLimit, setPerCustomerLimit] = useState(
    promotion?.perCustomerLimit?.toString() ?? ""
  );
  const [status, setStatus] = useState<PromotionStatus>(
    promotion?.status ?? "draft"
  );

  const [isSaving, setIsSaving] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────
  const isValid = useMemo(() => {
    if (!name.trim()) return false;
    if (!startDate || !endDate || endDate < startDate) return false;
    if (isCoupon && !code.trim()) return false;
    if (scopes.length === 0) return false;
    if (type === "standard" || type === "free_shipping") {
      if (type === "standard") {
        const v = parseFloat(discountValue);
        if (isNaN(v) || v <= 0) return false;
        if (discountType === "percentage" && v > 100) return false;
      }
    }
    if (type === "bundle" && bundleComponents.length < 2) return false;
    if (type === "bulk" && tiers.length === 0) return false;
    return true;
  }, [name, startDate, endDate, isCoupon, code, scopes, type, discountValue, discountType, bundleComponents, tiers]);

  // ── Live preview summary ──────────────────────────────────────────────────
  const previewText = useMemo(() => {
    const who = "Customers who";
    const scope = scopes.some((s) => s.scopeType === "global")
      ? "any product"
      : scopes.map((s) => s.scopeRefLabel ?? s.scopeRefId ?? "a qualifying product").join(" / ");

    if (type === "bxgy") {
      return `${who} buy ${bxgy.buyQuantity}× ${bxgy.buyProductLabel ?? scope} receive ${bxgy.getQuantity}× ${bxgy.getProductLabel ?? "same product"} at ${bxgy.getDiscountPercent === 100 ? "FREE" : `${bxgy.getDiscountPercent}% off`}. Max ${bxgy.maxApplicationsPerOrder} time(s) per order.`;
    }
    if (type === "bundle") {
      const parts = bundleComponents.map((c) => (c.refLabel ?? c.refId) || "?").join(" + ");
      return `${who} buy ${parts || "all required items"} together receive ${discountType === "percentage" ? `${discountValue}% off` : formatVND(parseFloat(discountValue) || 0)} on those items.`;
    }
    if (type === "bulk") {
      if (tiers.length === 0) return "Add tiers to preview.";
      const t = tiers[0];
      return `${who} buy ${t.minQuantity}+ eligible items receive ${t.discountType === "percentage" ? `${t.discountValue}% off` : `${formatVND(t.discountValue)} off per item`}. (${tiers.length} tier${tiers.length !== 1 ? "s" : ""} total)`;
    }
    if (type === "free_shipping") {
      return `${who} meet the conditions get free shipping on their order.`;
    }
    const discStr = discountType === "percentage"
      ? `${discountValue || "?"}% off`
      : `${formatVND(parseFloat(discountValue) || 0)} off`;
    const appStr = appLevel === "cart_total" ? "the cart total" : `each ${scope}`;
    return `${who} meet the conditions receive ${discStr} on ${appStr}.${startDate && endDate ? ` Applies ${startDate} – ${endDate}.` : ""}${totalUsageLimit ? ` Limit: ${totalUsageLimit} uses.` : ""}`;
  }, [type, scopes, bxgy, bundleComponents, tiers, discountType, discountValue, appLevel, startDate, endDate, totalUsageLimit]);

  // ── Build payload ─────────────────────────────────────────────────────────
  function buildPayload(): PromotionFormPayload {
    const baseAction = {
      actionType: (type === "bxgy" ? "bxgy" : type === "bundle" ? "bundle_discount" : type === "bulk" ? "bulk_discount" : type === "free_shipping" ? "free_shipping" : "percentage_discount") as PromotionFormPayload["actions"][0]["actionType"],
      applicationLevel: appLevel,
      discountType: (type === "standard" ? discountType : undefined) as DiscountType | undefined,
      discountValue: type === "standard" ? parseFloat(discountValue) : undefined,
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
      bxgy: type === "bxgy" ? bxgy : undefined,
      requiredComponents: type === "bundle" ? bundleComponents : undefined,
      tiers: type === "bulk" ? tiers : undefined,
    };

    // Determine actionType for standard more specifically
    if (type === "standard") {
      baseAction.actionType = appLevel === "cart_total" ? "fixed_discount_cart" : "percentage_discount";
      if (discountType === "percentage") baseAction.actionType = "percentage_discount";
      else if (appLevel === "cart_total") baseAction.actionType = "fixed_discount_cart";
      else baseAction.actionType = "fixed_discount_item";
    }

    return {
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      isCoupon,
      code: isCoupon ? code.trim().toUpperCase() || undefined : undefined,
      status,
      priority,
      stackingPolicy,
      startDate,
      endDate,
      totalUsageLimit: totalUsageLimit ? parseInt(totalUsageLimit, 10) : undefined,
      perCustomerLimit: perCustomerLimit ? parseInt(perCustomerLimit, 10) : undefined,
      scopes: scopes.map(scopeDraftToPayload),
      conditions: conditions.map(conditionDraftToPayload),
      actions: [baseAction],
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setIsSaving(true);
    try {
      const payload = buildPayload();
      if (mode === "create") {
        const created = await createPromotion(payload);
        showToast(`${isCoupon ? "Coupon" : "Promotion"} created.`, "success");
        router.push(`/promotions/${created.id}`);
      } else {
        await updatePromotion(promotion.id, payload);
        showToast("Changes saved.", "success");
        router.push(`/promotions/${promotion.id}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save.";
      showToast(msg, "error");
      setIsSaving(false);
    }
  }

  const title = mode === "create"
    ? (isCoupon ? "New Coupon" : "New Promotion")
    : `Edit ${promotion.isCoupon ? "Coupon" : "Promotion"}: ${promotion.name}`;

  const backHref = mode === "create" ? "/promotions" : `/promotions/${promotion.id}`;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/promotions" className="hover:text-secondary-700 transition-colors">Promotions</Link>
            {mode === "edit" && (
              <>
                <span>›</span>
                <Link href={`/promotions/${promotion.id}`} className="hover:text-secondary-700 transition-colors">{promotion.id}</Link>
              </>
            )}
            <span>›</span>
            <span className="text-secondary-600">{mode === "create" ? "New" : "Edit"}</span>
          </nav>
          <h1 className="mt-1 text-2xl font-bold text-secondary-900">{title}</h1>
        </div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Section 1: Basic Info ─────────────────────────────────────────── */}
        <Section title="1 — Basic Info">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <Input
                label="Promotion Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer GPU Flash Sale"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-secondary-500 mb-1.5">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {([
                  ["standard",     "Standard Discount"],
                  ["bxgy",         "Buy X Get Y"],
                  ["bundle",       "Bundle / Combo"],
                  ["bulk",         "Bulk / Tiered"],
                  ["free_shipping","Free Shipping"],
                ] as [PromotionType, string][]).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setType(v)}
                    className={[
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                      type === v
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-secondary-200 bg-white text-secondary-600 hover:bg-secondary-50",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-3 flex flex-wrap gap-6 items-start">
              <Toggle
                label="This is a Coupon"
                description="Requires a code to activate"
                checked={isCoupon}
                onChange={(e) => setIsCoupon(e.target.checked)}
              />
            </div>

            {isCoupon && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-secondary-500 mb-1.5">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                    placeholder="e.g. SUMMER20"
                    maxLength={30}
                    required={isCoupon}
                    className="flex-1 rounded-xl border border-secondary-300 bg-white px-3 py-2.5 font-mono text-sm font-semibold tracking-wide text-secondary-900 placeholder:font-normal focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setCode(generateCouponCode())}
                    title="Generate random code"
                    className="rounded-xl border border-secondary-200 bg-white px-3 py-2.5 text-secondary-500 hover:bg-secondary-50 hover:text-secondary-700 transition-colors"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-secondary-400">Only A–Z, 0–9, underscore, hyphen allowed.</p>
              </div>
            )}

            <div>
              <Input
                label="Priority"
                type="number"
                min={0}
                step={1}
                value={priority.toString()}
                onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)}
              />
              <p className="mt-1 text-[11px] text-secondary-400">Higher = evaluated first.</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 mb-2">Stacking Policy</p>
              <div className="flex flex-wrap gap-4">
                {([
                  ["exclusive",                 "Exclusive", "Cannot stack with any other promotion"],
                  ["stackable",                 "Stackable", "Stacks with all other stackable promotions"],
                  ["stackable_with_coupons_only","+ Coupons Only", "Auto-promos + only 1 coupon"],
                ] as [StackingPolicy, string, string][]).map(([v, label, hint]) => (
                  <label key={v} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stackingPolicy"
                      value={v}
                      checked={stackingPolicy === v}
                      onChange={() => setStackingPolicy(v)}
                      className="mt-0.5 accent-primary-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-secondary-800">{label}</p>
                      <p className="text-[11px] text-secondary-400">{hint}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Section 2: Scope ──────────────────────────────────────────────── */}
        <Section title="2 — Scope">
          <p className="text-xs text-secondary-500">
            Define which cart items this promotion can apply to.
          </p>
          <ScopeSelector scopes={scopes} onChange={setScopes} />
        </Section>

        {/* ── Section 3: Conditions ─────────────────────────────────────────── */}
        <Section title="3 — Conditions (ALL must pass)">
          <ConditionBuilder conditions={conditions} onChange={setConditions} />
        </Section>

        {/* ── Section 4: Action / Discount ─────────────────────────────────── */}
        <Section title="4 — Action & Discount">
          {type === "bxgy" && (
            <BxgyActionForm value={bxgy} onChange={setBxgy} />
          )}

          {type === "bundle" && (
            <>
              <BundleActionForm components={bundleComponents} onChange={setBundleComponents} />
              <div className="mt-4 grid gap-4 sm:grid-cols-3 pt-4 border-t border-secondary-100">
                <p className="sm:col-span-3 text-xs font-semibold text-secondary-600">Bundle Discount</p>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-secondary-500 mb-1.5">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full rounded-xl border border-secondary-300 bg-white px-3 py-2.5 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₫)</option>
                  </select>
                </div>
                <Input
                  label={discountType === "percentage" ? "Discount (%)" : "Discount Amount (₫)"}
                  type="number"
                  min={0}
                  max={discountType === "percentage" ? 100 : undefined}
                  step={discountType === "percentage" ? 1 : 1000}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "e.g. 8" : "e.g. 500000"}
                />
              </div>
            </>
          )}

          {type === "bulk" && (
            <BulkTiersForm tiers={tiers} onChange={setTiers} />
          )}

          {type === "free_shipping" && (
            <p className="text-sm text-secondary-600">
              Free shipping will be applied to the entire order when conditions are met.
            </p>
          )}

          {type === "standard" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-secondary-500 mb-1.5">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                  className="w-full rounded-xl border border-secondary-300 bg-white px-3 py-2.5 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₫)</option>
                </select>
              </div>
              <Input
                label={discountType === "percentage" ? "Discount (%)" : "Discount Amount (₫)"}
                type="number"
                min={0}
                max={discountType === "percentage" ? 100 : undefined}
                step={discountType === "percentage" ? 0.1 : 1000}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 100000"}
                required
              />
              {discountType === "percentage" && (
                <Input
                  label="Max Discount Cap (₫)"
                  type="number"
                  min={0}
                  step={1000}
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  placeholder="Optional — no cap if blank"
                />
              )}
              <div className="sm:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 mb-2">Applies To</p>
                <div className="flex gap-4">
                  {([
                    ["cart_total", "Entire Cart Total"],
                    ["per_item",   "Per Eligible Item"],
                    ["cheapest_item", "Cheapest Item Only"],
                  ] as [ApplicationLevel, string][]).map(([v, label]) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="appLevel"
                        value={v}
                        checked={appLevel === v}
                        onChange={() => setAppLevel(v)}
                        className="accent-primary-600"
                      />
                      <span className="text-sm text-secondary-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ── Section 5: Validity & Limits ─────────────────────────────────── */}
        <Section title="5 — Validity & Limits">
          <div className="grid gap-4 sm:grid-cols-3">
            <DateInput label="Start Date" value={startDate} onChange={setStartDate} required />
            <DateInput label="End Date" value={endDate} onChange={setEndDate} required />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-secondary-500 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PromotionStatus)}
                className="w-full rounded-xl border border-secondary-300 bg-white px-3 py-2.5 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <Input
              label="Total Usage Limit"
              type="number"
              min={1}
              step={1}
              value={totalUsageLimit}
              onChange={(e) => setTotalUsageLimit(e.target.value)}
              placeholder="Blank = unlimited"
            />
            {isCoupon && (
              <Input
                label="Per Customer Limit"
                type="number"
                min={1}
                step={1}
                value={perCustomerLimit}
                onChange={(e) => setPerCustomerLimit(e.target.value)}
                placeholder="Blank = unlimited"
              />
            )}
          </div>
          {endDate && startDate && endDate < startDate && (
            <p className="text-sm text-error-600 font-medium">End date must be after start date.</p>
          )}
        </Section>

        {/* ── Section 6: Description ────────────────────────────────────────── */}
        <Section title="6 — Internal Description">
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Internal notes about this promotion…"
            rows={3}
            maxCharCount={500}
            showCharCount
          />
        </Section>

        {/* ── Section 7: Preview ────────────────────────────────────────────── */}
        <Section title="7 — Preview">
          <div className="rounded-xl bg-info-50 border border-info-200 px-4 py-3">
            <p className="text-xs font-semibold text-info-700 mb-1">Plain-English Summary</p>
            <p className="text-sm text-info-800">{previewText}</p>
          </div>
        </Section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center rounded-xl border border-secondary-200 bg-white px-5 py-2.5 text-sm font-semibold text-secondary-700 hover:bg-secondary-50 transition-colors"
          >
            Cancel
          </Link>
          <Button type="submit" variant="primary" disabled={!isValid || isSaving} isLoading={isSaving}>
            {mode === "create" ? `Create ${isCoupon ? "Coupon" : "Promotion"}` : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
