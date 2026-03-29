"use client";

import { Input } from "@/src/components/ui/Input";

// ─── VariantInfoForm ──────────────────────────────────────────────────────────

export interface VariantInfoFormValue {
  name: string;
  sku: string;
  weight: string;
}

interface VariantInfoFormProps {
  value: VariantInfoFormValue;
  onChange: (value: VariantInfoFormValue) => void;
  errors?: Partial<Record<keyof VariantInfoFormValue, string>>;
}

export function VariantInfoForm({ value, onChange, errors = {} }: VariantInfoFormProps) {
  function set(field: keyof VariantInfoFormValue) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [field]: e.target.value });
  }

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
        Variant Info
      </h2>

      <div className="space-y-4">
        <Input
          label="Name"
          required
          value={value.name}
          onChange={set("name")}
          placeholder="e.g. 24GB GDDR6X — Standard Edition"
          errorMessage={errors.name}
        />

        <Input
          label="SKU"
          required
          value={value.sku}
          onChange={set("sku")}
          placeholder="e.g. ROG-RTX4090-OC-24G"
          errorMessage={errors.sku}
        />

        <Input
          label="Weight (kg)"
          type="number"
          min={0}
          step={0.01}
          value={value.weight}
          onChange={set("weight")}
          placeholder="e.g. 1.85"
          helperText="Leave blank if not applicable"
          errorMessage={errors.weight}
        />
      </div>
    </div>
  );
}
