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
      ? `Khách hàng dùng mã "${code || "…"}"`
      : "Khách hàng đáp ứng điều kiện";

    // ── Scope description (used where relevant) ──────────────────────────
    const scopeDesc = (() => {
      if (scopes.length === 0) return "chưa chọn sản phẩm";
      if (scopes.some((s) => s.scopeType === "global")) return "tất cả sản phẩm";
      return scopes
        .map((s) => s.scopeRefLabel ?? s.scopeRefId ?? "sản phẩm đủ điều kiện")
        .join(", ");
    })();

    // ── Validity / limits suffix ─────────────────────────────────────────
    const validSuffix = [
      startDate && endDate ? `Hiệu lực ${startDate} – ${endDate}.` : "",
      totalUsageLimit ? `Tối đa ${totalUsageLimit} lượt dùng.` : "",
      isCoupon && perCustomerLimit ? `Tối đa ${perCustomerLimit} lượt/khách.` : "",
    ].filter(Boolean).join(" ");

    // ── Per type ─────────────────────────────────────────────────────────
    if (type === "free_shipping") {
      const condNote = conditions.length > 0
        ? ` khi đáp ứng ${conditions.length} điều kiện`
        : "";
      return `${who} được miễn phí vận chuyển cho toàn bộ đơn hàng${condNote}. ${validSuffix}`.trim();
    }

    if (type === "bundle") {
      if (bundleComponents.length === 0) return "Thêm sản phẩm combo ở Mục 4 để xem trước.";
      const parts = bundleComponents.map((c) => c.refLabel ?? c.refId ?? "?").join(" + ");
      const discStr = discountType === "percentage"
        ? `giảm ${discountValue || "?"}%`
        : `giảm ${formatVND(parseFloat(discountValue) || 0)}`;
      return `${who} mua [${parts}] cùng nhau và nhận ${discStr} cho combo. ${validSuffix}`.trim();
    }

    if (type === "bxgy") {
      // Buy-side: specific product takes priority over scope
      const buySide = bxgy.buyProductLabel
        ? `${bxgy.buyQuantity}× ${bxgy.buyProductLabel}`
        : `${bxgy.buyQuantity}× sản phẩm từ [${scopeDesc}]`;
      // Get-side
      const getSide = bxgy.getProductLabel
        ? `${bxgy.getQuantity}× ${bxgy.getProductLabel}`
        : `${bxgy.getQuantity}× sản phẩm tương tự`;
      const reward = bxgy.getDiscountPercent === 100
        ? "MIỄN PHÍ"
        : `giảm ${bxgy.getDiscountPercent}%`;
      return `${who} mua ${buySide} → nhận ${getSide} ${reward}. Tối đa ${bxgy.maxApplicationsPerOrder} lần/đơn. ${validSuffix}`.trim();
    }

    if (type === "bulk") {
      if (tiers.length === 0) return "Thêm bậc giá ở Mục 4 để xem trước.";
      const tierLines = tiers.map((t, i) => {
        const range = t.maxQuantity ? `${t.minQuantity}–${t.maxQuantity}` : `${t.minQuantity}+`;
        const disc = t.discountType === "percentage"
          ? `giảm ${t.discountValue}%`
          : `giảm ${formatVND(t.discountValue)}/sản phẩm`;
        return `Bậc ${i + 1}: ${range} sản phẩm → ${disc}`;
      });
      const itemScope = scopes.some((s) => s.scopeType === "global")
        ? "sản phẩm đủ điều kiện"
        : `sản phẩm từ [${scopeDesc}]`;
      return `${who} mua ${itemScope}:\n${tierLines.join("\n")}\n${validSuffix}`.trim();
    }

    // standard ────────────────────────────────────────────────────────────
    if (type === "standard") {
      const discStr = discountType === "percentage"
        ? `giảm ${discountValue || "?"}%`
        : `giảm ${formatVND(parseFloat(discountValue) || 0)}`;
      const capNote = discountType === "percentage" && maxDiscountAmount
        ? ` (tối đa ${formatVND(parseFloat(maxDiscountAmount))})`
        : "";

      if (appLevel === "cart_total") {
        return `${who} được ${discStr}${capNote} trên tổng giá trị giỏ hàng. ${validSuffix}`.trim();
      }
      if (appLevel === "cheapest_item") {
        return `${who} được ${discStr}${capNote} trên sản phẩm rẻ nhất từ [${scopeDesc}]. ${validSuffix}`.trim();
      }
      // per_item
      return `${who} được ${discStr}${capNote} trên từng sản phẩm từ [${scopeDesc}]. ${validSuffix}`.trim();
    }

    return "Cấu hình khuyến mãi ở trên để xem trước.";
  }, [type, isCoupon, code, scopes, conditions, bxgy, bundleComponents, tiers, discountType, discountValue, maxDiscountAmount, appLevel, startDate, endDate, totalUsageLimit, perCustomerLimit]);

  // ── Condition lines for preview ───────────────────────────────────────────
  const previewConditions = useMemo((): string[] => {
    if (conditions.length === 0) return [];
    return conditions.map((cond) => {
      const raw = (() => { try { return JSON.parse(cond.value); } catch { return cond.value; } })();
      const arr: string[] = Array.isArray(raw) ? raw : (raw !== undefined && raw !== "" ? [String(raw)] : []);
      const list = arr.join(", ");
      switch (cond.type) {
        case "min_order_value": return `Giá trị đơn hàng ≥ ${formatVND(Number(raw))}`;
        case "min_item_quantity": return `Ít nhất ${raw} sản phẩm đủ điều kiện trong giỏ`;
        case "min_item_quantity_per_product": return `Ít nhất ${raw} sản phẩm giống nhau trong giỏ`;
        case "customer_group": return `Nhóm khách hàng: ${list}`;
        case "first_order_only": return "Chỉ áp dụng cho đơn hàng đầu tiên";
        case "required_products": return `Giỏ hàng phải chứa tất cả: ${list}`;
        case "required_categories": return `Giỏ hàng phải có sản phẩm từ: ${list}`;
        case "payment_method": return `Thanh toán qua: ${list}`;
        case "platform": return `Nền tảng: ${list}`;
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
        showToast(`${isCoupon ? "Mã giảm giá" : "Khuyến mãi"} đã được tạo.`, "success");
        router.push(`/promotions/${created.id}`);
      } else {
        await updatePromotion(promotion.id, payload);
        showToast("Đã lưu thay đổi.", "success");
        router.push(`/promotions/${promotion.id}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lưu thất bại.";
      showToast(msg, "error");
      setIsSaving(false);
    }
  }

  const title = mode === "create"
    ? (isCoupon ? "Mã giảm giá mới" : "Khuyến mãi mới")
    : `Chỉnh sửa ${promotion.isCoupon ? "mã giảm giá" : "khuyến mãi"}: ${promotion.name}`;

  const backHref = mode === "create" ? "/promotions" : `/promotions/${promotion.id}`;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/promotions" className="hover:text-secondary-700 transition-colors">Khuyến mãi</Link>
            {mode === "edit" && (
              <>
                <span>›</span>
                <Link href={`/promotions/${promotion.id}`} className="hover:text-secondary-700 transition-colors">{promotion.id}</Link>
              </>
            )}
            <span>›</span>
            <span className="text-secondary-600">{mode === "create" ? "Mới" : "Chỉnh sửa"}</span>
          </nav>
          <h1 className="mt-1 text-2xl font-bold text-secondary-900">{title}</h1>
        </div>
        <Button variant="secondary" className="rounded-lg" size="md" href={backHref} disabled={isSaving} leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
          Quay lại
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Section 1: Basic Info ─────────────────────────────────────────── */}
        <Section title="1 — Thông tin cơ bản">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <Input
                label="Tên khuyến mãi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Flash Sale GPU Mùa Hè"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-secondary-500 mb-1.5">
                Loại
              </label>
              <div className="flex flex-wrap gap-2">
                {([
                  ["standard", "Giảm giá thông thường"],
                  ["bxgy", "Mua X tặng Y"],
                  ["bundle", "Combo / Gói sản phẩm"],
                  ["bulk", "Số lượng lớn / Phân cấp"],
                  ["free_shipping", "Miễn phí vận chuyển"],
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
                label="Đây là mã giảm giá (Coupon)"
                description="Yêu cầu nhập mã code để kích hoạt"
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
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                    placeholder="VD: SUMMER20"
                    maxLength={30}
                    required={isCoupon}
                    className="flex-1 rounded-xl border border-secondary-300 bg-white px-3 py-2.5 font-mono text-sm font-semibold tracking-wide text-secondary-900 placeholder:font-normal focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setCode(generateCouponCode())}
                    title="Tạo mã ngẫu nhiên"
                    className="rounded-xl border border-secondary-200 bg-white px-3 py-2.5 text-secondary-500 hover:bg-secondary-50 hover:text-secondary-700 transition-colors"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-secondary-400">Chỉ cho phép A–Z, 0–9, dấu gạch dưới, dấu gạch ngang.</p>
              </div>
            )}

            {!isCoupon && (
              <div>
                <Input
                  label="Độ ưu tiên"
                  type="number"
                  min={0}
                  step={1}
                  value={priority.toString()}
                  onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)}
                />
                <p className="mt-1 text-[11px] text-secondary-400">Giá trị cao hơn = được ưu tiên xét trước.</p>
              </div>
            )}

            <div className={isCoupon ? "sm:col-span-3" : "sm:col-span-2"}>
              <RadioGroup legend="Chính sách kết hợp" direction="horizontal">
                <Radio
                  name="stackingPolicy"
                  value="exclusive"
                  label="Độc quyền"
                  description={
                    isCoupon
                      ? "Không thể kết hợp với bất kỳ khuyến mãi tự động nào đang hoạt động"
                      : "Không thể kết hợp với bất kỳ khuyến mãi nào khác"
                  }
                  checked={stackingPolicy === "exclusive"}
                  onChange={() => setStackingPolicy("exclusive")}
                />
                <Radio
                  name="stackingPolicy"
                  value="stackable"
                  label="Có thể kết hợp"
                  description={
                    isCoupon
                      ? "Áp dụng thêm lên các khuyến mãi tự động có thể kết hợp"
                      : "Kết hợp được với tất cả các khuyến mãi có thể kết hợp"
                  }
                  checked={stackingPolicy === "stackable"}
                  onChange={() => setStackingPolicy("stackable")}
                />
                {!isCoupon && (
                  <Radio
                    name="stackingPolicy"
                    value="stackable_with_coupons_only"
                    label="+ Chỉ với mã giảm giá"
                    description="Khuyến mãi tự động này cho phép thêm một mã giảm giá khi thanh toán"
                    checked={stackingPolicy === "stackable_with_coupons_only"}
                    onChange={() => setStackingPolicy("stackable_with_coupons_only")}
                  />
                )}
              </RadioGroup>
            </div>
          </div>
        </Section>

        {/* ── Section 2: Scope ──────────────────────────────────────────────── */}
        <Section title="2 — Phạm vi áp dụng">
          {/* bundle: scope is entirely defined by bundle components */}
          {type === "bundle" && (
            <p className="text-sm text-secondary-500 italic">
              Phạm vi được xác định bởi các sản phẩm combo trong Mục 4. Không cần chọn thêm.
            </p>
          )}

          {/* free_shipping: discount is on shipping fee, not on line items */}
          {type === "free_shipping" && (
            <p className="text-sm text-secondary-500 italic">
              Miễn phí vận chuyển áp dụng cho toàn bộ đơn hàng — không áp dụng cho từng sản phẩm. Dùng Điều kiện (Mục 3) để giới hạn điều kiện áp dụng (VD: giá trị đơn tối thiểu, sản phẩm bắt buộc).
            </p>
          )}

          {/* standard + cart_total: scope is forced global */}
          {type === "standard" && appLevel === "cart_total" && (
            <>
              <p className="text-xs text-secondary-500">
                Giảm giá áp dụng cho toàn bộ giỏ hàng — phạm vi tự động đặt thành Toàn cầu.
              </p>
              <div className="rounded-lg border border-secondary-200 bg-secondary-50 px-4 py-2.5 text-sm text-secondary-500 italic">
                Toàn cầu (tất cả sản phẩm) — bị khóa khi chọn &quot;Toàn bộ giỏ hàng&quot;
              </div>
            </>
          )}

          {/* bxgy: scope = buy-side eligibility pool */}
          {type === "bxgy" && (
            <>
              <p className="text-xs text-secondary-500">
                Xác định sản phẩm đủ điều kiện ở phía <span className="font-semibold text-secondary-700">Mua</span>. Bỏ qua khi đã chọn sản phẩm cụ thể ở Mục 4.
              </p>
              <ScopeSelector scopes={scopes} onChange={setScopes} />
            </>
          )}

          {/* bulk: scope = which items count toward tiers */}
          {type === "bulk" && (
            <>
              <p className="text-xs text-secondary-500">
                Chỉ sản phẩm thuộc phạm vi này mới được tính vào bậc số lượng và nhận giảm giá theo bậc.
              </p>
              <ScopeSelector scopes={scopes} onChange={setScopes} />
            </>
          )}

          {/* standard + per_item / cheapest_item: normal scope */}
          {type === "standard" && appLevel !== "cart_total" && (
            <>
              <p className="text-xs text-secondary-500">
                Xác định sản phẩm trong giỏ hàng mà giảm giá này có thể áp dụng.
              </p>
              <ScopeSelector scopes={scopes} onChange={setScopes} />
            </>
          )}
        </Section>

        {/* ── Section 3: Conditions ─────────────────────────────────────────── */}
        <Section title="3 — Điều kiện (TẤT CẢ phải thỏa mãn)">
          <ConditionBuilder conditions={conditions} onChange={setConditions} />
        </Section>

        {/* ── Section 4: Action / Discount ─────────────────────────────────── */}
        <Section title="4 — Hành động & Giảm giá">
          {type === "bxgy" && (
            <BxgyActionForm value={bxgy} onChange={setBxgy} />
          )}

          {type === "bundle" && (
            <>
              <BundleActionForm components={bundleComponents} onChange={setBundleComponents} />
              <div className="mt-4 grid gap-4 sm:grid-cols-3 pt-4 border-t border-secondary-100">
                <p className="sm:col-span-3 text-xs font-semibold text-secondary-600">Giảm giá combo</p>
                <div>
                  <Select
                    label="Loại giảm giá"
                    options={[
                      { value: "percentage", label: "Phần trăm (%)" },
                      { value: "fixed", label: "Số tiền cố định (₫)" },
                    ]}
                    value={discountType}
                    onChange={(v) => setDiscountType(v as DiscountType)}
                    helperText="Phần trăm: VD giảm 8% tổng giá trị combo. Cố định: VD trừ 200.000₫ từ tổng giá combo."
                  />
                </div>
                <Input
                  label={discountType === "percentage" ? "Giảm giá (%)" : "Số tiền giảm (₫)"}
                  type="number"
                  min={0}
                  max={discountType === "percentage" ? 100 : undefined}
                  step={discountType === "percentage" ? 1 : 1000}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "VD: 8" : "VD: 500000"}
                />
              </div>
            </>
          )}

          {type === "bulk" && (
            <BulkTiersForm tiers={tiers} onChange={setTiers} />
          )}

          {type === "free_shipping" && (
            <p className="text-sm text-secondary-600">
              Miễn phí vận chuyển sẽ được áp dụng cho toàn bộ đơn hàng khi đáp ứng điều kiện.
            </p>
          )}

          {type === "standard" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Select
                  label="Loại giảm giá"
                  options={[
                    { value: "percentage", label: "Phần trăm (%)" },
                    { value: "fixed", label: "Số tiền cố định (₫)" },
                  ]}
                  value={discountType}
                  onChange={(v) => setDiscountType(v as DiscountType)}
                  helperText="Phần trăm: trừ % trên giá trị đủ điều kiện. Cố định: trừ một số tiền nhất định."
                />
              </div>
              <Input
                label={discountType === "percentage" ? "Giảm giá (%)" : "Số tiền giảm (₫)"}
                type="number"
                min={0}
                max={discountType === "percentage" ? 100 : undefined}
                step={discountType === "percentage" ? 0.1 : 1000}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "VD: 20" : "VD: 100000"}
                required
              />
              {discountType === "percentage" && (
                <Input
                  label="Giới hạn giảm tối đa (₫)"
                  type="number"
                  min={0}
                  step={1000}
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  placeholder="Tùy chọn — bỏ trống = không giới hạn"
                />
              )}
              <div className="sm:col-span-3">
                <RadioGroup legend="Áp dụng cho" direction="horizontal">
                  <Radio
                    name="appLevel"
                    value="cart_total"
                    label="Toàn bộ giỏ hàng"
                    description="Giảm giá trên tổng phụ — phạm vi tự động đặt là Toàn cầu"
                    checked={appLevel === "cart_total"}
                    onChange={() => handleAppLevelChange("cart_total")}
                  />
                  <Radio
                    name="appLevel"
                    value="per_item"
                    label="Từng sản phẩm đủ điều kiện"
                    description="Mỗi sản phẩm đủ điều kiện được giảm riêng lẻ"
                    checked={appLevel === "per_item"}
                    onChange={() => handleAppLevelChange("per_item")}
                  />
                  <Radio
                    name="appLevel"
                    value="cheapest_item"
                    label="Chỉ sản phẩm rẻ nhất"
                    description="Chỉ sản phẩm rẻ nhất trong phạm vi được giảm giá"
                    checked={appLevel === "cheapest_item"}
                    onChange={() => handleAppLevelChange("cheapest_item")}
                  />
                </RadioGroup>
              </div>
            </div>
          )}
        </Section>

        {/* ── Section 5: Validity & Limits ─────────────────────────────────── */}
        <Section title="5 — Thời hạn & Giới hạn">
          <div className="grid gap-4 sm:grid-cols-3">
            <DateInput label="Ngày bắt đầu" value={startDate} onChange={setStartDate} required />
            <DateInput label="Ngày kết thúc" value={endDate} onChange={setEndDate} required />
            <div className="sm:col-span-3 sm:max-w-xs">
              <Select
                label="Trạng thái"
                options={[
                  { value: "draft", label: "Nháp" },
                  { value: "active", label: "Đang hoạt động" },
                  { value: "scheduled", label: "Đã lên lịch" },
                  { value: "paused", label: "Tạm dừng" },
                ]}
                value={status}
                onChange={(v) => setStatus(v as PromotionStatus)}
              />
              {/* Status description */}
              {status === "draft" && (
                <p className="mt-2 text-xs rounded-lg bg-secondary-50 border border-secondary-200 text-secondary-600 px-3 py-2">
                  Chưa hiển thị cho khách hàng. Lưu nháp mà không kích hoạt.
                </p>
              )}
              {status === "active" && (
                <p className="mt-2 text-xs rounded-lg bg-success-50 border border-success-200 text-success-700 px-3 py-2">
                  Đang hoạt động — tự động áp dụng khi tất cả điều kiện được thỏa mãn.
                </p>
              )}
              {status === "scheduled" && (
                <p className="mt-2 text-xs rounded-lg bg-info-50 border border-info-200 text-info-700 px-3 py-2">
                  Sẽ tự động kích hoạt vào Ngày bắt đầu. Hệ thống coi là đang hoạt động ngay khi đến ngày đó.
                </p>
              )}
              {status === "paused" && (
                <p className="mt-2 text-xs rounded-lg bg-warning-50 border border-warning-200 text-warning-700 px-3 py-2">
                  Tạm thời vô hiệu hóa. Không có giảm giá mới nào được áp dụng cho đến khi tiếp tục.
                </p>
              )}
              {/* Warn if scheduled but startDate is today or in the past */}
              {status === "scheduled" && startDate && startDate <= new Date().toISOString().slice(0, 10) && (
                <p className="mt-2 text-xs rounded-lg bg-warning-50 border border-warning-200 text-warning-700 px-3 py-2 font-medium">
                  ⚠ Ngày bắt đầu là hôm nay hoặc trong quá khứ — khuyến mãi này sẽ kích hoạt ngay khi lưu.
                </p>
              )}
            </div>
            <Input
              label="Tổng lượt sử dụng tối đa"
              type="number"
              min={1}
              step={1}
              value={totalUsageLimit}
              onChange={(e) => setTotalUsageLimit(e.target.value)}
              placeholder="Bỏ trống = không giới hạn"
            />
            {isCoupon && (
              <Input
                label="Giới hạn mỗi khách hàng"
                type="number"
                min={1}
                step={1}
                value={perCustomerLimit}
                onChange={(e) => setPerCustomerLimit(e.target.value)}
                placeholder="Bỏ trống = không giới hạn"
              />
            )}
          </div>
          {endDate && startDate && endDate < startDate && (
            <p className="text-sm text-error-600 font-medium">Ngày kết thúc phải sau ngày bắt đầu.</p>
          )}
        </Section>

        {/* ── Section 6: Description ────────────────────────────────────────── */}
        <Section title="6 — Mô tả nội bộ">
          <Textarea
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ghi chú nội bộ về khuyến mãi này…"
            rows={3}
            maxCharCount={500}
            showCharCount
          />
        </Section>

        {/* ── Section 7: Preview ────────────────────────────────────────────── */}
        <Section title="7 — Xem trước">
          <div className="rounded-xl bg-info-50 border border-info-200 px-4 py-3 space-y-3">
            {/* Core summary */}
            <div>
              <p className="text-xs font-semibold text-info-700 mb-1">Tóm tắt</p>
              <p className="text-sm text-info-800 whitespace-pre-line">{previewText}</p>
            </div>
            {/* Conditions */}
            {previewConditions.length > 0 && (
              <div className="pt-2.5 border-t border-info-200">
                <p className="text-xs font-semibold text-info-700 mb-1.5">
                  Điều kiện <span className="font-normal text-info-500">(TẤT CẢ phải thỏa mãn)</span>
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
                Không có điều kiện — áp dụng cho tất cả khách hàng đủ điều kiện.
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
            Hủy
          </Link>
          <Button type="submit" variant="primary" disabled={!isValid || isSaving} isLoading={isSaving}>
            {mode === "create" ? `Tạo ${isCoupon ? "mã giảm giá" : "khuyến mãi"}` : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
