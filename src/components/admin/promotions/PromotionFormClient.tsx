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
import { Select } from "@/src/components/ui/Select";
import { Radio, RadioGroup } from "@/src/components/ui/Radio";
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

  // ── Type / appLevel change handlers (manage scope side-effects) ───────────
  function handleTypeChange(newType: PromotionType) {
    setType(newType);
    // free_shipping: scope is irrelevant — force global so payload is consistent
    if (newType === "free_shipping") {
      setScopes([{ draftId: "scope-global-auto", scopeType: "global" }]);
    }
    // bundle: scope is fully defined by bundle components — clear
    if (newType === "bundle") {
      setScopes([]);
    }
    // standard → if currently cart_total, keep forcing global; handled via appLevel
    // bxgy / bulk: preserve existing scopes
  }

  function handleAppLevelChange(newLevel: ApplicationLevel) {
    setAppLevel(newLevel);
    // cart_total = discount on entire subtotal → scope must be global
    if (newLevel === "cart_total") {
      setScopes([{ draftId: "scope-global-auto", scopeType: "global" }]);
    }
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const isValid = useMemo(() => {
    if (!name.trim()) return false;
    if (!startDate || !endDate || endDate < startDate) return false;
    if (isCoupon && !code.trim()) return false;
    // scope not applicable for bundle (derived from components) or free_shipping (order-level)
    const scopeRequired = type !== "bundle" && type !== "free_shipping";
    if (scopeRequired && scopes.length === 0) return false;
    if (type === "standard") {
      const v = parseFloat(discountValue);
      if (isNaN(v) || v <= 0) return false;
      if (discountType === "percentage" && v > 100) return false;
    }
    if (type === "bundle" && bundleComponents.length < 2) return false;
    if (type === "bulk" && tiers.length === 0) return false;
    return true;
  }, [name, startDate, endDate, isCoupon, code, scopes, type, discountValue, discountType, bundleComponents, tiers]);

  // ── Live preview summary ──────────────────────────────────────────────────
  const previewText = useMemo(() => {
    const who = isCoupon
      ? `Customers using code "${code || "…"}"`
      : "Customers who meet the conditions";

    // ── Scope description (used where relevant) ──────────────────────────
    const scopeDesc = (() => {
      if (scopes.length === 0) return "no items selected";
      if (scopes.some((s) => s.scopeType === "global")) return "all products";
      return scopes
        .map((s) => s.scopeRefLabel ?? s.scopeRefId ?? "a qualifying item")
        .join(", ");
    })();

    // ── Validity / limits suffix ─────────────────────────────────────────
    const validSuffix = [
      startDate && endDate ? `Valid ${startDate} – ${endDate}.` : "",
      totalUsageLimit ? `Max ${totalUsageLimit} total uses.` : "",
      isCoupon && perCustomerLimit ? `Max ${perCustomerLimit} use(s) per customer.` : "",
    ].filter(Boolean).join(" ");

    // ── Per type ─────────────────────────────────────────────────────────
    if (type === "free_shipping") {
      const condNote = conditions.length > 0
        ? ` when ${conditions.length} condition${conditions.length > 1 ? "s" : ""} are met`
        : "";
      return `${who} get free shipping on their entire order${condNote}. ${validSuffix}`.trim();
    }

    if (type === "bundle") {
      if (bundleComponents.length === 0) return "Add bundle components in Section 4 to preview.";
      const parts = bundleComponents.map((c) => c.refLabel ?? c.refId ?? "?").join(" + ");
      const discStr = discountType === "percentage"
        ? `${discountValue || "?"}% off`
        : `${formatVND(parseFloat(discountValue) || 0)} off`;
      return `${who} buy [${parts}] together receive ${discStr} on the bundle. ${validSuffix}`.trim();
    }

    if (type === "bxgy") {
      // Buy-side: specific product takes priority over scope
      const buySide = bxgy.buyProductLabel
        ? `${bxgy.buyQuantity}× ${bxgy.buyProductLabel}`
        : `${bxgy.buyQuantity}× item from [${scopeDesc}]`;
      // Get-side
      const getSide = bxgy.getProductLabel
        ? `${bxgy.getQuantity}× ${bxgy.getProductLabel}`
        : `${bxgy.getQuantity}× same product`;
      const reward = bxgy.getDiscountPercent === 100
        ? "FREE"
        : `${bxgy.getDiscountPercent}% off`;
      return `${who} buy ${buySide} → receive ${getSide} at ${reward}. Max ${bxgy.maxApplicationsPerOrder} time(s)/order. ${validSuffix}`.trim();
    }

    if (type === "bulk") {
      if (tiers.length === 0) return "Add tiers in Section 4 to preview.";
      const tierLines = tiers.map((t, i) => {
        const range = t.maxQuantity ? `${t.minQuantity}–${t.maxQuantity}` : `${t.minQuantity}+`;
        const disc = t.discountType === "percentage"
          ? `${t.discountValue}% off`
          : `${formatVND(t.discountValue)} off/item`;
        return `Tier ${i + 1}: ${range} items → ${disc}`;
      });
      const itemScope = scopes.some((s) => s.scopeType === "global")
        ? "any eligible item"
        : `items from [${scopeDesc}]`;
      return `${who} buy ${itemScope}:\n${tierLines.join("\n")}\n${validSuffix}`.trim();
    }

    // standard ────────────────────────────────────────────────────────────
    if (type === "standard") {
      const discStr = discountType === "percentage"
        ? `${discountValue || "?"}% off`
        : `${formatVND(parseFloat(discountValue) || 0)} off`;
      const capNote = discountType === "percentage" && maxDiscountAmount
        ? ` (capped at ${formatVND(parseFloat(maxDiscountAmount))})`
        : "";

      if (appLevel === "cart_total") {
        return `${who} receive ${discStr}${capNote} on their entire cart subtotal. ${validSuffix}`.trim();
      }
      if (appLevel === "cheapest_item") {
        return `${who} receive ${discStr}${capNote} on the cheapest item from [${scopeDesc}]. ${validSuffix}`.trim();
      }
      // per_item
      return `${who} receive ${discStr}${capNote} on each item from [${scopeDesc}]. ${validSuffix}`.trim();
    }

    return "Configure the promotion above to see a preview.";
  }, [type, isCoupon, code, scopes, conditions, bxgy, bundleComponents, tiers, discountType, discountValue, maxDiscountAmount, appLevel, startDate, endDate, totalUsageLimit, perCustomerLimit]);

  // ── Condition lines for preview ───────────────────────────────────────────
  const previewConditions = useMemo((): string[] => {
    if (conditions.length === 0) return [];
    return conditions.map((cond) => {
      const raw = (() => { try { return JSON.parse(cond.value); } catch { return cond.value; } })();
      const arr: string[] = Array.isArray(raw) ? raw : (raw !== undefined && raw !== "" ? [String(raw)] : []);
      const list = arr.join(", ");
      switch (cond.type) {
        case "min_order_value": return `Order subtotal ≥ ${formatVND(Number(raw))}`;
        case "min_item_quantity": return `At least ${raw} eligible items in cart`;
        case "min_item_quantity_per_product": return `At least ${raw} of the same product in cart`;
        case "customer_group": return `Customer group is: ${list}`;
        case "first_order_only": return "First order only";
        case "required_products": return `Cart must contain all of: ${list}`;
        case "required_categories": return `Cart must include any from: ${list}`;
        case "payment_method": return `Payment via: ${list}`;
        case "platform": return `On platform: ${list}`;
        default: return `${cond.type}: ${cond.value}`;
      }
    });
  }, [conditions]);

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
                  ["standard", "Standard Discount"],
                  ["bxgy", "Buy X Get Y"],
                  ["bundle", "Bundle / Combo"],
                  ["bulk", "Bulk / Tiered"],
                  ["free_shipping", "Free Shipping"],
                ] as [PromotionType, string][]).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleTypeChange(v)}
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
                onChange={(e) => {
                  const next = e.target.checked;
                  setIsCoupon(next);
                  // "stackable_with_coupons_only" is only meaningful on auto-promotions
                  if (next && stackingPolicy === "stackable_with_coupons_only") {
                    setStackingPolicy("stackable");
                  }
                }}
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

            {!isCoupon && (
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
            )}

            <div className={isCoupon ? "sm:col-span-3" : "sm:col-span-2"}>
              <RadioGroup legend="Stacking Policy" direction="horizontal">
                <Radio
                  name="stackingPolicy"
                  value="exclusive"
                  label="Exclusive"
                  description={
                    isCoupon
                      ? "Cannot be combined with any active auto-promotion"
                      : "Cannot stack with any other promotion"
                  }
                  checked={stackingPolicy === "exclusive"}
                  onChange={() => setStackingPolicy("exclusive")}
                />
                <Radio
                  name="stackingPolicy"
                  value="stackable"
                  label="Stackable"
                  description={
                    isCoupon
                      ? "Stacks on top of active stackable auto-promotions"
                      : "Stacks with all other stackable promotions"
                  }
                  checked={stackingPolicy === "stackable"}
                  onChange={() => setStackingPolicy("stackable")}
                />
                {!isCoupon && (
                  <Radio
                    name="stackingPolicy"
                    value="stackable_with_coupons_only"
                    label="+ Coupons Only"
                    description="This auto-promo allows one coupon to stack at checkout"
                    checked={stackingPolicy === "stackable_with_coupons_only"}
                    onChange={() => setStackingPolicy("stackable_with_coupons_only")}
                  />
                )}
              </RadioGroup>
            </div>
          </div>
        </Section>

        {/* ── Section 2: Scope ──────────────────────────────────────────────── */}
        <Section title="2 — Scope">
          {/* bundle: scope is entirely defined by bundle components */}
          {type === "bundle" && (
            <p className="text-sm text-secondary-500 italic">
              Scope is defined by the bundle components in Section 4. No additional scope needed.
            </p>
          )}

          {/* free_shipping: discount is on shipping fee, not on line items */}
          {type === "free_shipping" && (
            <p className="text-sm text-secondary-500 italic">
              Free shipping applies to the entire order — not to individual cart items. Use Conditions (Section 3) to restrict eligibility (e.g. min order value, required products).
            </p>
          )}

          {/* standard + cart_total: scope is forced global */}
          {type === "standard" && appLevel === "cart_total" && (
            <>
              <p className="text-xs text-secondary-500">
                Discount is applied to the entire cart subtotal — scope is automatically set to Global.
              </p>
              <div className="rounded-lg border border-secondary-200 bg-secondary-50 px-4 py-2.5 text-sm text-secondary-500 italic">
                Global (all products) — locked while "Entire Cart Total" is selected
              </div>
            </>
          )}

          {/* bxgy: scope = buy-side eligibility pool */}
          {type === "bxgy" && (
            <>
              <p className="text-xs text-secondary-500">
                Defines which products are eligible on the <span className="font-semibold text-secondary-700">Buy side</span>. Ignored when a specific Buy Product is already selected in Section 4.
              </p>
              <ScopeSelector scopes={scopes} onChange={setScopes} />
            </>
          )}

          {/* bulk: scope = which items count toward tiers */}
          {type === "bulk" && (
            <>
              <p className="text-xs text-secondary-500">
                Only items matching this scope count toward quantity tiers and receive the tiered discount.
              </p>
              <ScopeSelector scopes={scopes} onChange={setScopes} />
            </>
          )}

          {/* standard + per_item / cheapest_item: normal scope */}
          {type === "standard" && appLevel !== "cart_total" && (
            <>
              <p className="text-xs text-secondary-500">
                Define which cart items this discount can apply to.
              </p>
              <ScopeSelector scopes={scopes} onChange={setScopes} />
            </>
          )}
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
                  <Select
                    label="Discount Type"
                    options={[
                      { value: "percentage", label: "Percentage (%)" },
                      { value: "fixed", label: "Fixed Amount (₫)" },
                    ]}
                    value={discountType}
                    onChange={(v) => setDiscountType(v as DiscountType)}
                    helperText="Percentage: e.g. 8% off the bundle subtotal. Fixed: e.g. -200,000₫ from the bundle total."
                  />
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
                <Select
                  label="Discount Type"
                  options={[
                    { value: "percentage", label: "Percentage (%)" },
                    { value: "fixed", label: "Fixed Amount (₫)" },
                  ]}
                  value={discountType}
                  onChange={(v) => setDiscountType(v as DiscountType)}
                  helperText="Percentage: deducts a % of the eligible subtotal. Fixed: deducts a set cash amount."
                />
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
                <RadioGroup legend="Applies To" direction="horizontal">
                  <Radio
                    name="appLevel"
                    value="cart_total"
                    label="Entire Cart Total"
                    description="Discount on the full subtotal — scope auto-set to Global"
                    checked={appLevel === "cart_total"}
                    onChange={() => handleAppLevelChange("cart_total")}
                  />
                  <Radio
                    name="appLevel"
                    value="per_item"
                    label="Per Eligible Item"
                    description="Each qualifying product is discounted individually"
                    checked={appLevel === "per_item"}
                    onChange={() => handleAppLevelChange("per_item")}
                  />
                  <Radio
                    name="appLevel"
                    value="cheapest_item"
                    label="Cheapest Item Only"
                    description="Only the lowest-priced item within scope is discounted"
                    checked={appLevel === "cheapest_item"}
                    onChange={() => handleAppLevelChange("cheapest_item")}
                  />
                </RadioGroup>
              </div>
            </div>
          )}
        </Section>

        {/* ── Section 5: Validity & Limits ─────────────────────────────────── */}
        <Section title="5 — Validity & Limits">
          <div className="grid gap-4 sm:grid-cols-3">
            <DateInput label="Start Date" value={startDate} onChange={setStartDate} required />
            <DateInput label="End Date" value={endDate} onChange={setEndDate} required />
            <div className="sm:col-span-3 sm:max-w-xs">
              <Select
                label="Status"
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "active", label: "Active" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "paused", label: "Paused" },
                ]}
                value={status}
                onChange={(v) => setStatus(v as PromotionStatus)}
              />
              {/* Status description */}
              {status === "draft" && (
                <p className="mt-2 text-xs rounded-lg bg-secondary-50 border border-secondary-200 text-secondary-600 px-3 py-2">
                  Not visible to customers. Save progress without activating.
                </p>
              )}
              {status === "active" && (
                <p className="mt-2 text-xs rounded-lg bg-success-50 border border-success-200 text-success-700 px-3 py-2">
                  Live now — automatically applies when all conditions are met.
                </p>
              )}
              {status === "scheduled" && (
                <p className="mt-2 text-xs rounded-lg bg-info-50 border border-info-200 text-info-700 px-3 py-2">
                  Will activate automatically on the Start Date. The engine treats it as active once that date is reached.
                </p>
              )}
              {status === "paused" && (
                <p className="mt-2 text-xs rounded-lg bg-warning-50 border border-warning-200 text-warning-700 px-3 py-2">
                  Temporarily disabled. No new discounts will be applied until resumed.
                </p>
              )}
              {/* Warn if scheduled but startDate is today or in the past */}
              {status === "scheduled" && startDate && startDate <= new Date().toISOString().slice(0, 10) && (
                <p className="mt-2 text-xs rounded-lg bg-warning-50 border border-warning-200 text-warning-700 px-3 py-2 font-medium">
                  ⚠ The start date is today or in the past — this promotion will activate immediately once saved.
                </p>
              )}
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
          <div className="rounded-xl bg-info-50 border border-info-200 px-4 py-3 space-y-3">
            {/* Core summary */}
            <div>
              <p className="text-xs font-semibold text-info-700 mb-1">Summary</p>
              <p className="text-sm text-info-800 whitespace-pre-line">{previewText}</p>
            </div>
            {/* Conditions */}
            {previewConditions.length > 0 && (
              <div className="pt-2.5 border-t border-info-200">
                <p className="text-xs font-semibold text-info-700 mb-1.5">
                  Conditions <span className="font-normal text-info-500">(ALL must pass)</span>
                </p>
                <ul className="space-y-1">
                  {previewConditions.map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-info-800">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-info-400" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* No conditions hint */}
            {previewConditions.length === 0 && (
              <p className="text-xs text-info-500 italic pt-2 border-t border-info-200">
                No conditions — applies to all eligible customers.
              </p>
            )}
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
