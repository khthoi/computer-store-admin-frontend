"use client";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Select } from "@/src/components/ui/Select";
import type { SocialLink, SocialPlatform } from "@/src/types/content.types";

// ─── Platform config (no emoji) ───────────────────────────────────────────────

export const SOCIAL_PLATFORM_CFG: {
  value: SocialPlatform;
  label: string;
  color: string;
}[] = [
  { value: "facebook",  label: "Facebook",    color: "#1877f2" },
  { value: "youtube",   label: "YouTube",     color: "#ff0000" },
  { value: "instagram", label: "Instagram",   color: "#e4405f" },
  { value: "tiktok",    label: "TikTok",      color: "#010101" },
  { value: "zalo",      label: "Zalo",        color: "#0068ff" },
  { value: "twitter",   label: "X (Twitter)", color: "#14171a" },
  { value: "linkedin",  label: "LinkedIn",    color: "#0077b5" },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Controlled list editor for social links.
 * Uses the UI Select component for platform selection (no emoji).
 */
export function SocialLinksEditor({
  value,
  onChange,
}: {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}) {
  function setPlatform(idx: number, platform: SocialPlatform) {
    onChange(value.map((s, i) => (i === idx ? { ...s, platform } : s)));
  }

  function setUrl(idx: number, url: string) {
    onChange(value.map((s, i) => (i === idx ? { ...s, url } : s)));
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function add() {
    const used = new Set(value.map((s) => s.platform));
    const next = SOCIAL_PLATFORM_CFG.find((p) => !used.has(p.value));
    if (next) {
      onChange([...value, { platform: next.value, url: "" }]);
    }
  }

  // Only offer platforms not already used by other rows
  function optionsForRow(idx: number) {
    const usedByOthers = new Set(
      value.filter((_, i) => i !== idx).map((s) => s.platform)
    );
    return SOCIAL_PLATFORM_CFG
      .filter((p) => !usedByOthers.has(p.value))
      .map((p) => ({ value: p.value, label: p.label }));
  }

  return (
    <div className="flex flex-col gap-3">
      {value.map((social, idx) => (
        <div key={idx} className="flex items-start gap-3">
          {/* Platform selector */}
          <div className="w-44 shrink-0">
            <Select
              options={optionsForRow(idx)}
              value={social.platform}
              onChange={(v) =>
                setPlatform(idx, (Array.isArray(v) ? v[0] : v) as SocialPlatform)
              }
              placeholder="Chọn nền tảng"
            />
          </div>

          {/* URL */}
          <div className="flex-1">
            <Input
              type="url"
              placeholder="https://facebook.com/pcstore"
              value={social.url}
              onChange={(e) => setUrl(idx, e.target.value)}
            />
          </div>

          {/* Remove */}
          <Tooltip content="Xóa" placement="top">
            <button
              type="button"
              onClick={() => remove(idx)}
              className="mt-1 shrink-0 rounded-lg p-2 text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      ))}

      {value.length < SOCIAL_PLATFORM_CFG.length && (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<PlusIcon className="h-3.5 w-3.5" />}
          onClick={add}
          type="button"
          className="self-start"
        >
          Thêm mạng xã hội
        </Button>
      )}

      {/* Colored badge preview */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((s) => {
            const cfg = SOCIAL_PLATFORM_CFG.find((p) => p.value === s.platform);
            if (!cfg) return null;
            return (
              <span
                key={s.platform}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: cfg.color }}
              >
                {cfg.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
