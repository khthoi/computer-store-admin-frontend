"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/src/components/ui/Tooltip";
import type { CategoryNode } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryTreeNodeProps {
  node: CategoryNode;
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  isSelectable: boolean;
  hasChildren: boolean;
  onSelect: (id: string, node: CategoryNode) => void;
  onToggleExpand: (id: string) => void;
  expandedIds: Set<string>;
  selectedId: string | undefined;
  selectableParents: boolean;
  searchQuery?: string;
}

// ─── Text highlight helper ────────────────────────────────────────────────────

function HighlightedLabel({
  label,
  query,
}: {
  label: string;
  query: string;
}) {
  if (!query.trim()) return <>{label}</>;

  const lower = label.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lower.indexOf(lowerQuery);
  if (idx === -1) return <>{label}</>;

  return (
    <>
      {label.slice(0, idx)}
      <mark className="rounded bg-primary-100 px-0.5 text-primary-800">
        {label.slice(idx, idx + query.length)}
      </mark>
      {label.slice(idx + query.length)}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryTreeNode({
  node,
  depth,
  isExpanded,
  isSelected,
  isSelectable,
  hasChildren,
  onSelect,
  onToggleExpand,
  expandedIds,
  selectedId,
  selectableParents,
  searchQuery = "",
}: CategoryTreeNodeProps) {
  // Row click: always expand/collapse for parent nodes; select for leaves
  function handleRowClick() {
    if (hasChildren) {
      onToggleExpand(node.id);
    } else {
      onSelect(node.id, node);
    }
  }

  // Label click: select the category (stops propagation so row expand doesn't fire)
  function handleLabelClick(e: React.MouseEvent) {
    if (!isSelectable) return;
    e.stopPropagation();
    onSelect(node.id, node);
  }

  const isNonSelectableParent = hasChildren && !isSelectable;

  return (
    <li
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-level={depth + 1}
      className="list-none"
    >
      {/* ── Row ── */}
      {/*
       * Two-layer layout:
       *   1. Outer div  — full-width click target (expand/collapse for parents,
       *                   select for leaves). Carries indentation via padding-left.
       *   2. Inner div  — content pill with bg highlight, scoped to chevron + label.
       *
       * For parent nodes the row always expands/collapses. Selecting a parent
       * requires clicking specifically on the label text, which stops propagation.
       */}
      <div
        onClick={handleRowClick}
        className={[
          "flex items-center py-0.5 select-none",
          hasChildren ? "cursor-pointer" : isNonSelectableParent ? "cursor-default" : "cursor-pointer",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        {/* ── Content pill ── */}
        <div
          className={[
            "flex flex-1 items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors",
            isSelected
              ? "bg-primary-50"
              : "hover:bg-secondary-50",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Chevron — larger hit area on parent nodes */}
          <span
            className={[
              "flex shrink-0 items-center justify-center rounded transition-transform",
              hasChildren
                ? "h-5 w-5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
                : "invisible h-4 w-4",
              isExpanded ? "rotate-90" : "rotate-0",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          >
            {hasChildren && <ChevronRightIcon className="h-4 w-4" />}
          </span>

          {/* Selected dot */}
          <span
            className={[
              "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
              isSelected ? "bg-primary-600" : "bg-transparent",
            ].join(" ")}
            aria-hidden="true"
          />

          {/* Label — outer span handles flex layout; inner span scopes click/hover to text only */}
          <span className="min-w-0 flex-1 overflow-hidden">
            <Tooltip
              content={
                hasChildren && isSelectable
                  ? `Bấm để chọn "${node.label}"`
                  : undefined
              }
              disabled={!(hasChildren && isSelectable)}
              placement="top"
              delay={400}
            >
              <span
                onClick={handleLabelClick}
                className={[
                  "inline truncate text-sm leading-5",
                  hasChildren && isSelectable
                    ? "cursor-pointer hover:text-primary-700 hover:underline"
                    : !isSelectable
                    ? "cursor-default"
                    : "cursor-pointer",
                  isSelected
                    ? "font-semibold text-primary-900"
                    : isNonSelectableParent
                    ? "font-medium text-secondary-400"
                    : "text-secondary-700",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <HighlightedLabel label={node.label} query={searchQuery} />
              </span>
            </Tooltip>
          </span>
        </div>
      </div>

      {/* ── Children ── */}
      {hasChildren && isExpanded && node.children && (
        <ul role="group" className="relative">
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isExpanded={expandedIds.has(child.id)}
              isSelected={selectedId === child.id}
              isSelectable={
                (child.children?.length ?? 0) > 0 ? selectableParents : true
              }
              hasChildren={(child.children?.length ?? 0) > 0}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              expandedIds={expandedIds}
              selectedId={selectedId}
              selectableParents={selectableParents}
              searchQuery={searchQuery}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
