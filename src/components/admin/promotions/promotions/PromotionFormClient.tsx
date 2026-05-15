"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowPathIcon, PencilSquareIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
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
  generateCouponCodeFromApi,
  getCouponCodeCooldown,
  duplicatePromotion,
  pausePromotion,
  activatePromotion,
  cancelPromotion,
} from "@/src/services/promotion.service";
import {
  ConditionBuilder,
  conditionDraftToPayload,
  conditionToEditDraft,
  type ConditionDraft,
} from "../conditions/ConditionBuilder";
import {
  ScopeSelector,
  scopeDraftToPayload,
  scopeToEditDraft,
  type ScopeDraft,
} from "../conditions/ScopeSelector";
import { BxgyActionForm, defaultBxgyFields } from "../conditions/BxgyActionForm";
import { BundleActionForm } from "../conditions/BundleActionForm";
import { BulkTiersForm } from "../conditions/BulkTiersForm";
import { formatVND } from "@/src/lib/format";
import type { ProductVariantFlat } from "@/src/services/product.service";
import type { CategoryNode } from "@/src/components/admin/CategoryTreeSelect";
import { buildNodeMap } from "@/src/components/admin/CategoryTreeSelect";
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
  PromotionFormAction,
} from "@/src/types/promotion.types";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props =
  | { mode: "create"; promotion?: never }
  | { mode: "edit"; promotion: Promotion }
  | { mode: "view"; promotion: Promotion };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract YYYY-MM-DD from a full ISO timestamp returned by the backend */
function toDateOnly(val: string | undefined): string {
  if (!val) return "";
  return val.slice(0, 10);
}

/** Format "YYYY-MM-DD" → "DD/MM/YYYY" for display */
function formatDateVI(iso: string): string {
  if (!iso || iso.length < 10) return iso;
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

// ─── Section card wrapper ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-secondary-900">{title}</h2>
      {children}
    </div>
  );
}

// ─── Per-type explanation data ────────────────────────────────────────────────

const TYPE_EXPLANATIONS: Record<
  PromotionType,
  { label: string; cardCls: string; badgeCls: string; headingCls: string; textCls: string; description: string; steps: string[]; example: string }
> = {
  standard: {
    label: "Giảm giá thông thường",
    cardCls: "bg-primary-50 border-primary-200",
    badgeCls: "bg-primary-100 text-primary-700",
    headingCls: "text-primary-900",
    textCls: "text-primary-700",
    description: "Giảm giá trực tiếp trên tổng giỏ hàng, từng sản phẩm, hoặc chỉ sản phẩm rẻ nhất — theo phần trăm (%) hoặc số tiền cố định (₫).",
    steps: [
      "Chọn loại giảm (% hoặc ₫) và nhập mức giảm ở Mục 2.",
      "Chọn phạm vi áp dụng: toàn bộ giỏ hàng, từng sản phẩm, hoặc sản phẩm rẻ nhất.",
      "Giới hạn sản phẩm đủ điều kiện ở Mục 4 nếu không muốn áp dụng toàn bộ.",
    ],
    example: "VD: Giảm 20% tất cả RAM Kingston · Giảm 500.000₫ cho đơn từ 5 triệu",
  },
  bxgy: {
    label: "Mua X tặng Y",
    cardCls: "bg-success-50 border-success-200",
    badgeCls: "bg-success-100 text-success-700",
    headingCls: "text-success-900",
    textCls: "text-success-700",
    description: "Khách mua đủ số lượng sản phẩm A sẽ nhận thêm sản phẩm B miễn phí hoặc được giảm giá — hệ thống tự động xử lý khi checkout.",
    steps: [
      "Chọn sản phẩm phải mua (phía Mua) và số lượng yêu cầu ở Mục 2.",
      "Chọn sản phẩm sẽ được tặng/giảm giá (phía Tặng) và mức giảm (100% = miễn phí).",
      "Chọn chế độ: hệ thống tự thêm vào giỏ hay để khách tự chọn từ danh sách.",
    ],
    example: "VD: Mua 1 CPU Intel i5 → nhận 1 tản nhiệt Deepcool MIỄN PHÍ",
  },
  bundle: {
    label: "Combo / Gói sản phẩm",
    cardCls: "bg-warning-50 border-warning-200",
    badgeCls: "bg-warning-100 text-warning-700",
    headingCls: "text-warning-900",
    textCls: "text-warning-700",
    description: "Khách mua đồng thời tất cả sản phẩm trong combo sẽ được giảm giá trên tổng giá trị combo. Thiếu bất kỳ thành phần nào, combo không được áp dụng.",
    steps: [
      "Thêm ít nhất 2 thành phần vào combo ở Mục 2 (danh mục, sản phẩm, hoặc phiên bản cụ thể).",
      "Đặt số lượng tối thiểu cho mỗi thành phần.",
      "Cấu hình mức giảm giá (% hoặc ₫) cho toàn bộ combo.",
    ],
    example: "VD: Mua CPU + RAM + Mainboard cùng lúc → giảm 8% tổng giá combo",
  },
  bulk: {
    label: "Số lượng lớn / Phân cấp",
    cardCls: "bg-info-50 border-info-200",
    badgeCls: "bg-info-100 text-info-700",
    headingCls: "text-info-900",
    textCls: "text-info-700",
    description: "Mua càng nhiều, giảm càng nhiều — theo các bậc số lượng đã cấu hình. Chỉ bậc cao nhất phù hợp được áp dụng cho toàn bộ số lượng.",
    steps: [
      "Thêm các bậc số lượng ở Mục 2 (VD: 3–5, 6–10, 11+) và mức giảm cho mỗi bậc.",
      "Chọn phạm vi sản phẩm áp dụng ở Mục 4 (chỉ các sản phẩm này mới được tính vào bậc).",
      "Kiểm tra các bậc không bị chồng lấp và không có khoảng trống giữa các bậc.",
    ],
    example: "VD: Mua 3–5 SSD → giảm 5% · Mua 6–10 → giảm 10% · Mua 11+ → giảm 15%",
  },
  free_shipping: {
    label: "Miễn phí vận chuyển",
    cardCls: "bg-secondary-50 border-secondary-200",
    badgeCls: "bg-secondary-100 text-secondary-600",
    headingCls: "text-secondary-900",
    textCls: "text-secondary-600",
    description: "Toàn bộ phí vận chuyển được miễn khi khách đáp ứng điều kiện. Không ảnh hưởng đến giá sản phẩm, có thể kết hợp với khuyến mãi giảm giá khác.",
    steps: [
      "Đặt điều kiện ở Mục 3 (VD: đơn từ 500.000₫, nhóm khách hàng, sản phẩm bắt buộc).",
      "Không cần chọn phạm vi sản phẩm — miễn phí ship áp dụng cho toàn bộ đơn hàng.",
      "Bỏ trống điều kiện nếu muốn miễn phí ship cho tất cả mọi đơn.",
    ],
    example: "VD: Miễn phí ship cho đơn từ 500.000₫ · Miễn phí ship cho thành viên Gold",
  },
};

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
  const [startDate, setStartDate] = useState(toDateOnly(promotion?.startDate));
  const [endDate, setEndDate] = useState(toDateOnly(promotion?.endDate));
  const [totalUsageLimit, setTotalUsageLimit] = useState(
    promotion?.totalUsageLimit?.toString() ?? ""
  );
  const [perCustomerLimit, setPerCustomerLimit] = useState(
    promotion?.perCustomerLimit?.toString() ?? ""
  );
  const [status, setStatus] = useState<PromotionStatus>(
    promotion?.status ?? "draft"
  );

  // ── Condition lookup data (populated from ConditionBuilder callbacks) ─────────
  const [variantFlats, setVariantFlats] = useState<ProductVariantFlat[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);

  const variantMap = useMemo(
    () => new Map(variantFlats.map((v) => [v.variantId, v])),
    [variantFlats]
  );
  const categoryMap = useMemo(() => buildNodeMap(categoryTree), [categoryTree]);

  // Async-search variants stream in incrementally — merge by variantId so
  // previously-seen entries (including current selections) are not dropped.
  const handleVariantsLoaded = useCallback((v: ProductVariantFlat[]) => {
    setVariantFlats((prev) => {
      const seen = new Map(prev.map((p) => [p.variantId, p]));
      for (const nv of v) seen.set(nv.variantId, nv);
      return Array.from(seen.values());
    });
  }, []);
  const handleCategoriesLoaded = useCallback((c: CategoryNode[]) => setCategoryTree(c), []);

  const [isSaving, setIsSaving] = useState(false);

  // ── Code-gen cooldown ──────────────────────────────────────────────────────
  const [codeGenCooldownMs, setCodeGenCooldownMs] = useState(0);
  const codeGenTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mount: reconcile localStorage + API to restore cooldown after refresh/logout
  useEffect(() => {
    let cancelled = false;
    const localEnd = parseInt(localStorage.getItem("coupon_code_gen_end") ?? "0", 10);
    const localRemaining = localEnd - Date.now();
    if (localRemaining > 0) setCodeGenCooldownMs(localRemaining);

    getCouponCodeCooldown()
      .then(({ remainingMs }) => {
        if (cancelled) return;
        if (remainingMs > 0) setCodeGenCooldownMs((prev) => Math.max(prev, remainingMs));
      })
      .catch(() => {});

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown ticker — 10ms precision
  useEffect(() => {
    if (codeGenCooldownMs <= 0) return;
    codeGenTimerRef.current = setInterval(() => {
      setCodeGenCooldownMs((prev) => {
        const next = prev - 10;
        if (next <= 0) {
          clearInterval(codeGenTimerRef.current!);
          codeGenTimerRef.current = null;
          return 0;
        }
        return next;
      });
    }, 10);
    return () => {
      if (codeGenTimerRef.current) clearInterval(codeGenTimerRef.current);
    };
  // run only when cooldown starts (goes from 0 → positive)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeGenCooldownMs > 0]);

  async function handleGenerateCode() {
    try {
      const { code: generated, cooldownMs } = await generateCouponCodeFromApi();
      setCode(generated);
      setCodeGenCooldownMs(cooldownMs);
      localStorage.setItem("coupon_code_gen_end", String(Date.now() + cooldownMs));
    } catch {
      showToast("Không thể tạo mã giảm giá, vui lòng thử lại.", "error");
    }
  }

  // ── View mode state ────────────────────────────────────────────────────────
  const viewMode = mode === "view";
  const [isBusy, setIsBusy] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const canEdit = viewMode && ["draft", "scheduled", "active", "paused"].includes(promotion?.status ?? "");
  const canPause = viewMode && promotion?.status === "active";
  const canResume = viewMode && promotion?.status === "paused";
  const canCancel = viewMode && ["active", "scheduled", "draft"].includes(promotion?.status ?? "");

  async function handleViewAction(fn: () => Promise<Promotion>, msg: string) {
    setIsBusy(true);
    try {
      await fn();
      showToast(msg, "success");
      router.refresh();
    } catch {
      showToast("Thao tác thất bại.", "error");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDuplicate() {
    if (!promotion) return;
    setIsBusy(true);
    try {
      const copy = await duplicatePromotion(promotion.id);
      showToast(`Đã nhân bản thành "${copy.name}".`, "success");
      router.push(`/promotions/${copy.id}/edit`);
    } catch {
      showToast("Nhân bản thất bại.", "error");
    } finally {
      setIsBusy(false);
    }
  }

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
    // bxgy: scope is fully defined by the buy/get product selection — clear
    if (newType === "bxgy") {
      setScopes([]);
    }
    // standard → if currently cart_total, keep forcing global; handled via appLevel
    // bulk: preserve existing scopes
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
    // scope not applicable for bundle (derived from components), free_shipping (order-level), or bxgy (buy/get products define scope)
    const scopeRequired = type !== "bundle" && type !== "free_shipping" && type !== "bxgy";
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
      startDate && endDate ? `Hiệu lực ${formatDateVI(startDate)} – ${formatDateVI(endDate)}.` : "",
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
      if (bundleComponents.length === 0) return "Thêm sản phẩm combo ở Mục 2 để xem trước.";
      const parts = bundleComponents.map((c) => c.refLabel ?? c.refId ?? "?").join(" + ");
      const discStr = discountType === "percentage"
        ? `giảm ${discountValue || "?"}%`
        : `giảm ${formatVND(parseFloat(discountValue) || 0)}`;
      return `${who} mua [${parts}] cùng nhau và nhận ${discStr} cho combo. ${validSuffix}`.trim();
    }

    if (type === "bxgy") {
      // Buy-side: label preferred; fall back to "(loading)" when ID is set but label not yet resolved
      const buySide = bxgy.buyProductLabel
        ? `${bxgy.buyQuantity}× ${bxgy.buyProductLabel}`
        : bxgy.buyProductId
        ? `${bxgy.buyQuantity}× (đang tải tên phiên bản...)`
        : `${bxgy.buyQuantity}× [chưa chọn phiên bản]`;
      // Get-side
      const getSide = bxgy.getProductLabel
        ? `${bxgy.getQuantity}× ${bxgy.getProductLabel}`
        : bxgy.getProductId
        ? `${bxgy.getQuantity}× (đang tải tên phiên bản...)`
        : `${bxgy.getQuantity}× cùng phiên bản mua`;
      const reward = bxgy.getDiscountPercent === 100
        ? "MIỄN PHÍ"
        : `giảm ${bxgy.getDiscountPercent}%`;
      return `${who} mua ${buySide} → nhận ${getSide} ${reward}. Tối đa ${bxgy.maxApplicationsPerOrder} lần/đơn. ${validSuffix}`.trim();
    }

    if (type === "bulk") {
      if (tiers.length === 0) return "Thêm bậc giá ở Mục 2 để xem trước.";
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
  const previewConditions = useMemo((): { key: string; content: React.ReactNode }[] => {
    if (conditions.length === 0) return [];
    const result: { key: string; content: React.ReactNode }[] = [];

    conditions.forEach((cond, idx) => {
      const raw = (() => { try { return JSON.parse(cond.value); } catch { return cond.value; } })();
      const arr: string[] = Array.isArray(raw) ? raw : (raw !== undefined && raw !== "" ? [String(raw)] : []);

      switch (cond.type) {
        case "min_order_value":
          result.push({ key: `${idx}`, content: `Giá trị đơn hàng ≥ ${formatVND(Number(raw))}` });
          break;
        case "min_item_quantity":
          result.push({ key: `${idx}`, content: `Ít nhất ${raw} sản phẩm trong giỏ hàng` });
          break;
        case "min_item_quantity_per_product":
          result.push({ key: `${idx}`, content: `Ít nhất ${raw} sản phẩm giống nhau trong giỏ` });
          break;
        case "customer_group":
          result.push({ key: `${idx}`, content: `Nhóm khách hàng: ${arr.join(", ")}` });
          break;
        case "first_order_only":
          result.push({ key: `${idx}`, content: "Chỉ áp dụng cho đơn hàng đầu tiên" });
          break;
        case "required_products":
          if (arr.length === 0) {
            result.push({ key: `${idx}`, content: "Giỏ hàng phải chứa tất cả phiên bản: (chưa chọn)" });
          } else {
            result.push({
              key: `${idx}`,
              content: (
                <span>
                  Giỏ hàng phải chứa <strong>tất cả</strong> phiên bản sản phẩm:
                  <ul className="mt-1 ml-1 space-y-0.5">
                    {arr.map((vid, si) => {
                      const vdata = variantMap.get(vid);
                      const label = vdata ? `${vdata.productName} — ${vdata.variantName}` : vid;
                      const href = vdata ? `/products/${vdata.productId}/variants/${vid}` : undefined;
                      return (
                        <li key={si} className="flex items-start gap-1.5">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-info-400" />
                          {href ? (
                            <Link href={href} className="underline text-primary-700 hover:text-primary-900" target="_blank">
                              {label}
                            </Link>
                          ) : label}
                        </li>
                      );
                    })}
                  </ul>
                </span>
              ),
            });
          }
          break;
        case "required_categories":
          if (arr.length === 0) {
            result.push({ key: `${idx}`, content: "Giỏ hàng phải có ≥1 sản phẩm từ danh mục: (chưa chọn)" });
          } else {
            result.push({
              key: `${idx}`,
              content: (
                <span>
                  Giỏ hàng phải có <strong>≥1 sản phẩm</strong> từ danh mục:
                  <ul className="mt-1 ml-1 space-y-0.5">
                    {arr.map((catId, si) => {
                      const node = categoryMap.get(catId);
                      return (
                        <li key={si} className="flex items-start gap-1.5">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-info-400" />
                          {node ? node.label : catId}
                        </li>
                      );
                    })}
                  </ul>
                </span>
              ),
            });
          }
          break;
        case "payment_method":
          result.push({ key: `${idx}`, content: `Thanh toán qua: ${arr.join(", ")}` });
          break;
        case "platform":
          result.push({ key: `${idx}`, content: `Nền tảng: ${arr.join(", ")}` });
          break;
        default:
          result.push({ key: `${idx}`, content: `${cond.type}: ${cond.value}` });
      }
    });

    return result;
  }, [conditions, variantMap, categoryMap]);

  // ── Build payload ─────────────────────────────────────────────────────────
  function buildPayload(): PromotionFormPayload {
    // Resolve actionType
    let actionType: PromotionFormAction["actionType"];
    if (type === "bxgy") actionType = "bxgy";
    else if (type === "bundle") actionType = "bundle_discount";
    else if (type === "bulk") actionType = "bulk_discount";
    else if (type === "free_shipping") actionType = "free_shipping";
    else if (discountType === "percentage") actionType = "percentage_discount";
    else if (appLevel === "cart_total") actionType = "fixed_discount_cart";
    else actionType = "fixed_discount_item";

    const baseAction: PromotionFormAction = {
      actionType,
      applicationLevel: appLevel,
    };

    // Standard / bundle share discount fields
    if (type === "standard" || type === "bundle") {
      baseAction.discountType = discountType;
      const v = parseFloat(discountValue);
      if (!isNaN(v)) baseAction.discountValue = v;
    }
    if (type === "standard" && discountType === "percentage" && maxDiscountAmount) {
      baseAction.maxDiscountAmount = parseFloat(maxDiscountAmount);
    }

    // BXGY — flat fields matching backend CreateActionDto
    if (type === "bxgy") {
      baseAction.bxgyBuyQty = bxgy.buyQuantity;
      if (bxgy.buyProductId) baseAction.bxgyBuyProductId = bxgy.buyProductId;
      baseAction.bxgyGetQty = bxgy.getQuantity;
      if (bxgy.getProductId) baseAction.bxgyGetProductId = bxgy.getProductId;
      baseAction.bxgyGetDiscountPct = bxgy.getDiscountPercent;
      baseAction.bxgyDeliveryMode = bxgy.deliveryMode;
      baseAction.bxgyMaxApplications = bxgy.maxApplicationsPerOrder;
      if (bxgy.eligibleFreeProductIds?.length) {
        baseAction.bxgyEligibleProductIds = JSON.stringify(bxgy.eligibleFreeProductIds);
      }
    }

    // Bulk tiers
    if (type === "bulk") baseAction.bulkTiers = tiers;

    // Bundle components — backend expects bulkComponents (not requiredComponents)
    if (type === "bundle") {
      baseAction.bulkComponents = bundleComponents.map((c) => ({
        scope: c.scope,
        refId: c.refId,
        refLabel: c.refLabel,
        minQuantity: c.minQuantity,
      }));
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
    : mode === "view"
    ? promotion.name
    : `Chỉnh sửa ${promotion.isCoupon ? "mã giảm giá" : "khuyến mãi"}: ${promotion.name}`;

  const backHref = mode === "create" ? "/promotions" : `/promotions/${promotion!.id}`;

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
                <span>›</span>
                <span className="text-secondary-600">Chỉnh sửa</span>
              </>
            )}
            {mode === "view" && (
              <>
                <span>›</span>
                <span className="font-mono text-secondary-600">{promotion.id}</span>
              </>
            )}
            {mode === "create" && (
              <>
                <span>›</span>
                <span className="text-secondary-600">Mới</span>
              </>
            )}
          </nav>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900">{title}</h1>
            {viewMode && <StatusBadge status={promotion.status} />}
            {viewMode && promotion.isCoupon && promotion.code && (
              <span className="rounded-md bg-secondary-100 px-2 py-0.5 font-mono text-xs font-bold tracking-wide text-secondary-700">
                {promotion.code}
              </span>
            )}
          </div>
        </div>

        {/* View mode: action buttons */}
        {viewMode ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="rounded-lg" size="md" onClick={() => router.push("/promotions")} disabled={isBusy} leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
              Quay lại
            </Button>
            <Button variant="secondary" className="rounded-lg" size="md" onClick={handleDuplicate} disabled={isBusy}>
              <DocumentDuplicateIcon className="w-4 h-4 mr-1.5" />
              Nhân bản
            </Button>
            {canEdit && (
              <Button variant="secondary" className="rounded-lg" size="md" onClick={() => router.push(`/promotions/${promotion.id}/edit`)} disabled={isBusy}>
                <PencilSquareIcon className="w-4 h-4 mr-1.5" />
                Chỉnh sửa
              </Button>
            )}
            {canPause && (
              <Button variant="secondary" className="rounded-lg" size="md" onClick={() => handleViewAction(() => pausePromotion(promotion.id), "Đã tạm dừng khuyến mãi.")} disabled={isBusy}>
                Tạm dừng
              </Button>
            )}
            {canResume && (
              <Button variant="primary" className="rounded-lg" size="md" onClick={() => handleViewAction(() => activatePromotion(promotion.id), "Đã kích hoạt khuyến mãi.")} disabled={isBusy}>
                Tiếp tục
              </Button>
            )}
            {canCancel && (
              <Button variant="danger" className="rounded-lg" size="md" onClick={() => setShowCancelConfirm(true)} disabled={isBusy}>
                Hủy bỏ
              </Button>
            )}
          </div>
        ) : (
          <Button variant="secondary" className="rounded-lg" size="md" href={backHref} disabled={isSaving} leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
            Quay lại
          </Button>
        )}
      </div>

      <form onSubmit={viewMode ? (e) => e.preventDefault() : handleSubmit} className="space-y-6">
      <fieldset disabled={viewMode} style={{ border: "none", padding: 0, margin: 0 }} className="space-y-6">

        {/* ── Promotion type explanation ────────────────────────────────────── */}
        {(() => {
          const exp = TYPE_EXPLANATIONS[type];
          return (
            <div className={`rounded-2xl border p-5 space-y-3 ${exp.cardCls}`}>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${exp.badgeCls}`}>
                  {exp.label}
                </span>
              </div>
              <p className={`text-sm ${exp.textCls}`}>{exp.description}</p>
              <ol className="space-y-1.5">
                {exp.steps.map((step, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-xs ${exp.textCls}`}>
                    <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full ${exp.badgeCls} flex items-center justify-center text-[10px] font-bold`}>
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className={`text-xs italic px-3 py-2 rounded-lg bg-white/50 ${exp.textCls}`}>{exp.example}</p>
            </div>
          );
        })()}

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
                  if (next && !code.trim() && codeGenCooldownMs <= 0) handleGenerateCode();
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
                    onClick={handleGenerateCode}
                    disabled={codeGenCooldownMs > 0}
                    title={codeGenCooldownMs > 0 ? `Chờ ${(codeGenCooldownMs / 1000).toFixed(2)}s` : "Tạo mã ngẫu nhiên"}
                    className="min-w-[56px] rounded-xl border border-secondary-200 bg-white px-3 py-2.5 text-secondary-500 hover:bg-secondary-50 hover:text-secondary-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center"
                  >
                    {codeGenCooldownMs > 0
                      ? <span className="text-xs font-mono tabular-nums">{(codeGenCooldownMs / 1000).toFixed(2)}</span>
                      : <ArrowPathIcon className="w-4 h-4" />
                    }
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

        {/* ── Section 2: Action / Discount ─────────────────────────────────── */}
        <Section title="2 — Hành động & Giảm giá">
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

        {/* ── Section 3: Conditions ─────────────────────────────────────────── */}
        <Section title="3 — Điều kiện (TẤT CẢ phải thỏa mãn)">
          <ConditionBuilder
            conditions={conditions}
            onChange={setConditions}
            onVariantsLoaded={handleVariantsLoaded}
            onCategoriesLoaded={handleCategoriesLoaded}
          />
          {/* Warn when min_item_quantity condition is redundant for bulk (tiers already enforce qty) */}
          {type === "bulk" && conditions.some((c) => c.type === "min_item_quantity") && (
            <div className="flex items-start gap-2 rounded-lg bg-warning-50 border border-warning-200 px-3 py-2 text-xs text-warning-700">
              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span>
                Điều kiện <span className="font-semibold">số lượng tối thiểu</span> có thể trùng lặp với ngưỡng bậc đầu tiên — cân nhắc xóa điều kiện này để tránh nhầm lẫn.
              </span>
            </div>
          )}
          {/* Warn when min_item_quantity condition is redundant for bundle */}
          {type === "bundle" && conditions.some((c) => c.type === "min_item_quantity") && (
            <div className="flex items-start gap-2 rounded-lg bg-warning-50 border border-warning-200 px-3 py-2 text-xs text-warning-700">
              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span>
                Combo đã xác định số lượng tối thiểu cho từng thành phần — điều kiện <span className="font-semibold">số lượng tối thiểu</span> có thể gây xung đột.
              </span>
            </div>
          )}
        </Section>

        {/* ── Section 4: Scope ──────────────────────────────────────────────── */}
        <Section title="4 — Phạm vi áp dụng">
          {/* bundle: scope is entirely defined by bundle components */}
          {type === "bundle" && (
            <p className="text-sm text-secondary-500 italic">
              Phạm vi được xác định bởi các sản phẩm combo trong Mục 2. Không cần chọn thêm.
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

          {/* bxgy: scope is entirely defined by the buy/get product selection in Section 2 */}
          {type === "bxgy" && (
            <p className="text-sm text-secondary-500 italic">
              Phạm vi được xác định bởi sản phẩm đã chọn ở Mục 2 (phía Mua và phía Tặng). Không cần chọn thêm.
            </p>
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
                  {previewConditions.map(({ key, content }) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-info-800">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-info-400" />
                      {content}
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

      </fieldset>

        {/* ── Footer (hidden in view mode) ─────────────────────────────────── */}
        {!viewMode && (
          <div className="flex justify-end gap-3 mt-6">
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
        )}
      </form>

      {/* Cancel confirm modal (view mode) */}
      {viewMode && showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-secondary-900">Hủy bỏ khuyến mãi?</h3>
            <p className="mt-2 text-sm text-secondary-600">
              Khuyến mãi sẽ kết thúc ngay lập tức. Các đơn hàng đã đặt vẫn giữ nguyên giảm giá. Hành động này không thể hoàn tác.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowCancelConfirm(false)}>Giữ nguyên</Button>
              <Button
                variant="danger"
                isLoading={isBusy}
                onClick={() => {
                  setShowCancelConfirm(false);
                  handleViewAction(() => cancelPromotion(promotion!.id), "Đã hủy bỏ khuyến mãi.");
                }}
              >
                Xác nhận hủy bỏ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
