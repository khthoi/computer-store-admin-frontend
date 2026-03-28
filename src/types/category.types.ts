// ─── Category domain types ─────────────────────────────────────────────────

export type DanhMucStatus = "active" | "inactive";

export interface DanhMuc {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  displayOrder: number;
  active: boolean;
  productCount: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/** Tree node shape — mirrors CategoryNode from CategoryTreeView but typed from domain */
export interface DanhMucNode extends DanhMuc {
  children?: DanhMucNode[];
}
