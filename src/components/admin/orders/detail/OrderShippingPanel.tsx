"use client";

import { useEffect, useState } from "react";
import {
  ClipboardDocumentIcon,
  TruckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { DateInput } from "@/src/components/ui/DateInput";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShippingInfo {
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  address: {
    fullName: string;
    phone: string;
    street: string;
    ward: string;
    district: string;
    city: string;
  };
}

interface OrderShippingPanelProps {
  shipping: ShippingInfo;
  onUpdate: (info: Partial<ShippingInfo>) => void;
  isSaving?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CARRIER_OPTIONS = [
  { value: "ghn", label: "GHN" },
  { value: "ghtk", label: "GHTK" },
  { value: "viettelpost", label: "Viettel Post" },
  { value: "jt", label: "J&T Express" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderShippingPanel({
  shipping,
  onUpdate,
  isSaving = false,
}: OrderShippingPanelProps) {
  const [carrier, setCarrier] = useState(shipping.carrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(shipping.trackingNumber ?? "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    shipping.estimatedDelivery ?? ""
  );
  const [copied, setCopied] = useState(false);

  // Sync when shipping prop changes
  useEffect(() => {
    setCarrier(shipping.carrier ?? "");
    setTrackingNumber(shipping.trackingNumber ?? "");
    setEstimatedDelivery(shipping.estimatedDelivery ?? "");
  }, [shipping]);

  function handleCopyTracking() {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(trackingNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleSave() {
    const changed: Partial<ShippingInfo> = {};
    if (carrier !== (shipping.carrier ?? "")) changed.carrier = carrier;
    if (trackingNumber !== (shipping.trackingNumber ?? ""))
      changed.trackingNumber = trackingNumber;
    if (estimatedDelivery !== (shipping.estimatedDelivery ?? ""))
      changed.estimatedDelivery = estimatedDelivery;
    onUpdate(changed);
  }

  const { address } = shipping;
  const formattedAddress = [
    address.street,
    address.ward,
    address.district,
    address.city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-4 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-secondary-900">Thông tin vận chuyển</h3>

      {/* Carrier */}
      <Select
        label="Đơn vị vận chuyển"
        options={CARRIER_OPTIONS}
        value={carrier}
        onChange={(v) => setCarrier(v as string)}
        placeholder="Chọn đơn vị vận chuyển…"
        clearable
      />

      {/* Tracking number */}
      <div>
        <label className="mb-1 block text-sm font-medium text-secondary-700">
          Mã vận đơn
        </label>
        <div className="flex items-center gap-2">
          <Input
            className="font-mono flex-1"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="VD123456789"
          />
          <button
            type="button"
            aria-label={copied ? "Đã sao chép" : "Sao chép mã vận đơn"}
            onClick={handleCopyTracking}
            disabled={!trackingNumber}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-secondary-200 bg-secondary-50 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ClipboardDocumentIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        {copied && (
          <p className="mt-1 text-xs text-success-600">Đã sao chép!</p>
        )}
      </div>

      {/* Estimated delivery */}
      <DateInput
        label="Dự kiến giao hàng"
        value={estimatedDelivery}
        onChange={(val) => setEstimatedDelivery(val)}
        placeholder="DD/MM/YYYY"
      />

      {/* Track shipment link */}
      {trackingNumber && (
        <a
          href={`https://tracking.example.com?code=${encodeURIComponent(trackingNumber)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          <TruckIcon className="w-4 h-4" aria-hidden="true" />
          Theo dõi vận chuyển
        </a>
      )}

      {/* Shipping address — read-only */}
      <div className="rounded-xl bg-secondary-50 border border-secondary-100 p-3 space-y-0.5">
        <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-1">
          Địa chỉ giao hàng
        </p>
        <p className="text-sm font-medium text-secondary-800">{address.fullName}</p>
        <p className="text-sm text-secondary-600">{address.phone}</p>
        <p className="text-sm text-secondary-600">{formattedAddress}</p>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-1">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          isLoading={isSaving}
        >
          {isSaving ? "Đang lưu…" : "Lưu"}
        </Button>
      </div>
    </div>
  );
}
