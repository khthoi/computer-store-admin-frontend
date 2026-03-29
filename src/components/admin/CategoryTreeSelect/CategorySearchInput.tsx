"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

// ─── CategorySearchInput ──────────────────────────────────────────────────────

interface CategorySearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CategorySearchInput({
  value,
  onChange,
  placeholder = "Search categories…",
}: CategorySearchInputProps) {
  return (
    <div className="relative flex items-center border-b border-secondary-100 px-3 py-2.5">
      <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-secondary-400" />
      <input
        type="text"
        autoFocus
        autoComplete="off"
        spellCheck={false}
        aria-label="Search categories"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mx-2 min-w-0 flex-1 bg-transparent text-sm text-secondary-900 placeholder:text-secondary-400 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600"
        >
          <XMarkIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
