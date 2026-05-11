"use client";

import { useState, type KeyboardEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LowStockRules {
  threshold: number;
  reorderQty: number;
  alertEmails: string[];
  alertChannels: { email: boolean; dashboard: boolean };
}

export interface LowStockRulesFormProps {
  value: LowStockRules;
  onChange: (v: LowStockRules) => void;
  onSave: () => void;
  isSaving?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LowStockRulesForm — card form for configuring inventory alert rules.
 *
 * Features:
 * - Numeric inputs for minimum threshold and suggested reorder quantity.
 * - Tag-input for alert email addresses with inline validation.
 * - Checkbox controls for alert channels (email / dashboard).
 * - Save button with loading spinner.
 */
export function LowStockRulesForm({
  value,
  onChange,
  onSave,
  isSaving = false,
}: LowStockRulesFormProps) {
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  // ── Helpers ────────────────────────────────────────────────────────────────

  function update(patch: Partial<LowStockRules>) {
    onChange({ ...value, ...patch });
  }

  function addEmail() {
    const trimmed = emailInput.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      setEmailError("Địa chỉ email không hợp lệ");
      return;
    }
    if (value.alertEmails.includes(trimmed)) {
      setEmailError("Email đã được thêm");
      return;
    }
    update({ alertEmails: [...value.alertEmails, trimmed] });
    setEmailInput("");
    setEmailError("");
  }

  function removeEmail(email: string) {
    update({ alertEmails: value.alertEmails.filter((e) => e !== email) });
  }

  function handleEmailKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail();
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6">
      {/* Card header */}
      <h2 className="text-base font-semibold text-secondary-900 mb-5">
        Quy tắc cảnh báo tồn kho
      </h2>

      <div className="flex flex-col gap-5">
        {/* Minimum threshold */}
        <Input
          label="Ngưỡng tồn kho tối thiểu"
          type="number"
          min={0}
          value={value.threshold === 0 ? "" : String(value.threshold)}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            update({ threshold: isNaN(v) ? 0 : v });
          }}
          helperText="Cảnh báo khi tồn kho dưới mức này"
          placeholder="VD: 10"
        />

        {/* Reorder quantity */}
        <Input
          label="Số lượng đặt lại gợi ý"
          type="number"
          min={0}
          value={value.reorderQty === 0 ? "" : String(value.reorderQty)}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            update({ reorderQty: isNaN(v) ? 0 : v });
          }}
          placeholder="VD: 50"
        />

        {/* Alert emails — tag input */}
        <div>
          <label className="mb-1 block text-sm font-medium text-secondary-700">
            Email nhận cảnh báo
          </label>

          {/* Existing email chips */}
          {value.alertEmails.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {value.alertEmails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
                >
                  {email}
                  <button
                    type="button"
                    aria-label={`Xóa ${email}`}
                    onClick={() => removeEmail(email)}
                    className="rounded-full hover:text-primary-900 focus:outline-none"
                  >
                    <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add new email */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onKeyDown={handleEmailKeyDown}
                placeholder="email@example.com"
                className={[
                  "w-full h-10 rounded border bg-white px-3 text-sm text-secondary-700",
                  "placeholder:text-secondary-400 focus:outline-none focus:ring-2",
                  emailError
                    ? "border-error-400 focus:border-error-500 focus:ring-error-500/15"
                    : "border-secondary-300 focus:border-primary-500 focus:ring-primary-500/15",
                ].join(" ")}
              />
              {emailError && (
                <p className="mt-1 text-xs text-error-600">{emailError}</p>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={addEmail}
            >
              Thêm
            </Button>
          </div>
          <p className="mt-1 text-xs text-secondary-400">
            Nhấn Enter hoặc dấu phẩy để thêm email
          </p>
        </div>

        {/* Alert channels */}
        <div>
          <p className="mb-2 text-sm font-medium text-secondary-700">
            Kênh nhận cảnh báo
          </p>
          <div className="flex flex-col gap-2">
            <Checkbox
              label="Email"
              checked={value.alertChannels.email}
              onChange={(e) =>
                update({
                  alertChannels: {
                    ...value.alertChannels,
                    email: e.target.checked,
                  },
                })
              }
            />
            <Checkbox
              label="Dashboard notification"
              checked={value.alertChannels.dashboard}
              onChange={(e) =>
                update({
                  alertChannels: {
                    ...value.alertChannels,
                    dashboard: e.target.checked,
                  },
                })
              }
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-1">
          <Button
            variant="primary"
            onClick={onSave}
            isLoading={isSaving}
            disabled={isSaving}
          >
            Lưu cài đặt
          </Button>
        </div>
      </div>
    </div>
  );
}
