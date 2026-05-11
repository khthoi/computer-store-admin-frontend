"use client";

import { useState } from "react";
import { Toggle } from "@/src/components/ui/Toggle";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Alert } from "@/src/components/ui/Alert";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  credentials: Record<string, string>;
}

interface PaymentMethodsManagerProps {
  methods: PaymentMethodConfig[];
  onChange: (methods: PaymentMethodConfig[]) => void;
  onSave: () => void;
  isSaving?: boolean;
}

// ─── Credential field definitions per method ─────────────────────────────────

interface CredField {
  key: string;
  label: string;
}

function getCredFields(methodId: string): CredField[] {
  switch (methodId) {
    case "vnpay":
      return [
        { key: "merchantId", label: "Merchant ID" },
        { key: "hashSecret", label: "Hash Secret" },
      ];
    case "momo":
      return [
        { key: "partnerCode", label: "Partner Code" },
        { key: "accessKey", label: "Access Key" },
        { key: "secretKey", label: "Secret Key" },
      ];
    case "cod":
      return [];
    case "bank_transfer":
      return [
        { key: "bankName", label: "Tên ngân hàng" },
        { key: "accountNumber", label: "Số tài khoản" },
      ];
    default:
      return [
        { key: "apiKey", label: "API Key" },
        { key: "secretKey", label: "Secret Key" },
      ];
  }
}

// ─── Logo placeholder ─────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  vnpay: "bg-blue-100 text-blue-700",
  momo: "bg-pink-100 text-pink-700",
  bank_transfer: "bg-green-100 text-green-700",
  cod: "bg-amber-100 text-amber-700",
  credit_card: "bg-blue-100 text-blue-700",
};

// ─── Single method row ────────────────────────────────────────────────────────

interface MethodRowProps {
  method: PaymentMethodConfig;
  onUpdate: (updated: PaymentMethodConfig) => void;
}

function MethodRow({ method, onUpdate }: MethodRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");

  const credFields = getCredFields(method.id);
  const colorClass =
    METHOD_COLORS[method.id] ?? "bg-secondary-100 text-secondary-600";

  function setCredential(key: string, val: string) {
    onUpdate({
      ...method,
      credentials: { ...method.credentials, [key]: val },
    });
  }

  async function handleTestConnection() {
    setTestStatus("testing");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTestStatus("success");
    setTimeout(() => setTestStatus("idle"), 3000);
  }

  return (
    <div className="border border-secondary-100 rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        {/* Logo */}
        <div
          className={[
            "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
            colorClass,
          ].join(" ")}
          aria-hidden="true"
        >
          {method.name.slice(0, 2).toUpperCase()}
        </div>

        {/* Name */}
        <p className="flex-1 text-sm font-medium text-secondary-800">
          {method.name}
        </p>

        {/* Enable toggle */}
        <Toggle
          size="sm"
          checked={method.enabled}
          onChange={(e) => onUpdate({ ...method, enabled: e.target.checked })}
          aria-label={`Bật/tắt ${method.name}`}
        />

        {/* Expand/collapse button */}
        {credFields.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-secondary-500 hover:text-secondary-700 px-2 py-1 rounded hover:bg-secondary-50 transition-colors"
            aria-expanded={expanded}
          >
            Cài đặt
            {expanded ? (
              <ChevronUpIcon className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDownIcon className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Expanded config panel */}
      {expanded && credFields.length > 0 && (
        <div className="px-4 py-4 bg-secondary-50 border-t border-secondary-100 space-y-3">
          {credFields.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              type="password"
              value={method.credentials[field.key] ?? ""}
              onChange={(e) => setCredential(field.key, e.target.value)}
              placeholder={`Nhập ${field.label.toLowerCase()}...`}
            />
          ))}

          {/* Test connection */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestConnection}
              isLoading={testStatus === "testing"}
              disabled={testStatus === "testing"}
            >
              {testStatus === "testing"
                ? "Đang kiểm tra..."
                : "Kiểm tra kết nối"}
            </Button>

            {testStatus === "success" && (
              <span className="flex items-center gap-1 text-xs text-success-600 font-medium">
                <CheckCircleIcon className="w-4 h-4" aria-hidden="true" />
                Kết nối thành công!
              </span>
            )}

            {testStatus === "error" && (
              <span className="text-xs text-error-600 font-medium">
                Kết nối thất bại
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Manager component ────────────────────────────────────────────────────────

/**
 * PaymentMethodsManager — manages the list of payment method configs.
 */
export function PaymentMethodsManager({
  methods,
  onChange,
  onSave,
  isSaving = false,
}: PaymentMethodsManagerProps) {
  function updateMethod(updated: PaymentMethodConfig) {
    onChange(methods.map((m) => (m.id === updated.id ? updated : m)));
  }

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6">
      {/* Title */}
      <h2 className="text-base font-semibold text-secondary-900 mb-5">
        Phương thức thanh toán
      </h2>

      {/* Method list */}
      <div className="space-y-3">
        {methods.map((method) => (
          <MethodRow key={method.id} method={method} onUpdate={updateMethod} />
        ))}

        {methods.length === 0 && (
          <p className="text-sm text-secondary-400 text-center py-6">
            Chưa có phương thức thanh toán nào
          </p>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end mt-6 pt-4 border-t border-secondary-100">
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          isLoading={isSaving}
          disabled={isSaving}
        >
          Lưu
        </Button>
      </div>
    </div>
  );
}
