// ─── Select — CreateOptionItem sub-component ─────────────────────────────────

import { PlusIcon } from "@heroicons/react/24/outline";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CreateOptionItemProps {
  label: string;
  isActive: boolean;
  onCreate: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateOptionItem({
  label,
  isActive,
  onCreate,
}: CreateOptionItemProps) {
  return (
    <li
      role="option"
      aria-selected={false}
      onClick={onCreate}
      className={[
        "flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-sm outline-none transition-colors",
        "border-t border-secondary-100",
        isActive
          ? "bg-primary-50 text-primary-700"
          : "text-primary-600 hover:bg-primary-50",
      ].join(" ")}
    >
      <PlusIcon className="size-4 shrink-0 opacity-70" aria-hidden="true" />
      <span>
        Tạo{" "}
        <span className="font-semibold">&ldquo;{label}&rdquo;</span>
      </span>
    </li>
  );
}
