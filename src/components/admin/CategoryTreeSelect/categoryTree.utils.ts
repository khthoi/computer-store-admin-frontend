// ─── CategoryTreeSelect — pure utility functions ─────────────────────────────

import type { CategoryNode } from "./types";

// ── buildNodeMap ──────────────────────────────────────────────────────────────

/**
 * Flatten the tree into a Map<id, node> for O(1) lookup by id.
 */
export function buildNodeMap(
  nodes: CategoryNode[],
  map: Map<string, CategoryNode> = new Map()
): Map<string, CategoryNode> {
  for (const node of nodes) {
    map.set(node.id, node);
    if (node.children?.length) buildNodeMap(node.children, map);
  }
  return map;
}

// ── buildBreadcrumb ───────────────────────────────────────────────────────────

/**
 * Build the ancestor path (breadcrumb) for a given node id.
 * Returns the array from root → target, or null if the id is not found.
 */
export function buildBreadcrumb(
  id: string,
  nodes: CategoryNode[],
  path: CategoryNode[] = []
): CategoryNode[] | null {
  for (const node of nodes) {
    const next = [...path, node];
    if (node.id === id) return next;
    if (node.children?.length) {
      const found = buildBreadcrumb(id, node.children, next);
      if (found) return found;
    }
  }
  return null;
}

// ── flattenTree ───────────────────────────────────────────────────────────────

export interface FlatNode {
  node: CategoryNode;
  depth: number;
  parentId: string | null;
}

/**
 * Flatten the entire tree to a list of FlatNode entries, each annotated with
 * its depth and parent id (null for root nodes).
 */
export function flattenTree(
  nodes: CategoryNode[],
  depth = 0,
  parentId: string | null = null
): FlatNode[] {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    result.push({ node, depth, parentId });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1, node.id));
    }
  }
  return result;
}

// ── filterTree ────────────────────────────────────────────────────────────────

/**
 * Return a pruned copy of the tree that contains only nodes whose label
 * matches `query` (case-insensitive), plus their ancestor nodes so the
 * result remains navigable.
 *
 * Does NOT mutate the input — returns new node objects when children differ.
 */
export function filterTree(nodes: CategoryNode[], query: string): CategoryNode[] {
  if (!query.trim()) return nodes;
  const lower = query.toLowerCase();

  const result: CategoryNode[] = [];
  for (const node of nodes) {
    const selfMatches = node.label.toLowerCase().includes(lower);
    const filteredChildren = node.children?.length
      ? filterTree(node.children, query)
      : [];

    if (selfMatches || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children?.length ? [] : undefined,
        // If self matches but none of its children match, still show all children
        // so the user can see what lives under the matched parent.
        ...(selfMatches && node.children?.length
          ? { children: node.children }
          : filteredChildren.length > 0
          ? { children: filteredChildren }
          : {}),
      });
    }
  }
  return result;
}

// ── collectIds ────────────────────────────────────────────────────────────────

/**
 * Collect all node ids from a (possibly filtered) tree — used to expand
 * everything when a search query is active.
 */
export function collectAllIds(nodes: CategoryNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    if (node.children?.length) ids.push(...collectAllIds(node.children));
  }
  return ids;
}
