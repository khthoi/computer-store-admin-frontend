"use client";

import { useState } from "react";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import type { TabItem } from "@/src/components/ui/Tabs";
import { ProductGeneralForm } from "./ProductGeneralForm";
import { ProductVariantsForm } from "./ProductVariantsForm";
import { ProductSpecificationsForm } from "./ProductSpecificationsForm";
import { ProductSEOForm } from "./ProductSEOForm";
import { MediaUploadPanel } from "@/src/components/admin/shared/MediaUploadPanel";
import type { ProductGeneralData } from "./ProductGeneralForm";
import type {
  ProductVariant,
  VariantAttribute,
} from "./ProductVariantsForm";
import type { SpecRow } from "./ProductSpecificationsForm";
import type { ProductSEOData } from "./ProductSEOForm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AllProductData {
  general: ProductGeneralData;
  variants: ProductVariant[];
  attributes: VariantAttribute[];
  specs: SpecRow[];
  seo: ProductSEOData;
}

export interface ProductFormTabsProps {
  productId?: string;
  initialData?: Partial<AllProductData>;
}

// ─── Tab keys ─────────────────────────────────────────────────────────────────

const TAB_GENERAL = "general";
const TAB_VARIANTS = "variants";
const TAB_IMAGES = "images";
const TAB_SEO = "seo";
const TAB_SPECS = "specs";

// ─── Default state ────────────────────────────────────────────────────────────

function defaultGeneral(): ProductGeneralData {
  return {
    name: "",
    sku: "",
    brand: "",
    category: "",
    shortDescription: "",
    status: "draft",
    tags: [],
  };
}

function defaultSEO(): ProductSEOData {
  return {
    metaTitle: "",
    metaDescription: "",
    slug: "",
    canonicalUrl: "",
  };
}

// ─── Dirty dot indicator ──────────────────────────────────────────────────────

function DirtyDot() {
  return (
    <span
      className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-warning-500 align-middle"
      title="Có thay đổi chưa lưu"
      aria-label="Có thay đổi chưa lưu"
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductFormTabs({ initialData }: ProductFormTabsProps) {
  const [generalData, setGeneralData] = useState<ProductGeneralData>(
    initialData?.general ?? defaultGeneral()
  );
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants ?? []
  );
  const [attributes, setAttributes] = useState<VariantAttribute[]>(
    initialData?.attributes ?? []
  );
  const [specs, setSpecs] = useState<SpecRow[]>(initialData?.specs ?? []);
  const [seoData, setSeoData] = useState<ProductSEOData>(
    initialData?.seo ?? defaultSEO()
  );

  // Track dirty tabs
  const [dirtyTabs, setDirtyTabs] = useState<Set<string>>(new Set());

  function markDirty(tab: string) {
    setDirtyTabs((prev) => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  }

  // ── Tab definitions ────────────────────────────────────────────────────────

  const tabs: TabItem[] = [
    {
      value: TAB_GENERAL,
      label: (
        <span>
          Thông tin chung
          {dirtyTabs.has(TAB_GENERAL) && <DirtyDot />}
        </span>
      ),
    },
    {
      value: TAB_VARIANTS,
      label: (
        <span>
          Biến thể
          {dirtyTabs.has(TAB_VARIANTS) && <DirtyDot />}
        </span>
      ),
    },
    {
      value: TAB_IMAGES,
      label: (
        <span>
          Hình ảnh
          {dirtyTabs.has(TAB_IMAGES) && <DirtyDot />}
        </span>
      ),
    },
    {
      value: TAB_SEO,
      label: (
        <span>
          SEO
          {dirtyTabs.has(TAB_SEO) && <DirtyDot />}
        </span>
      ),
    },
    {
      value: TAB_SPECS,
      label: (
        <span>
          Thông số kỹ thuật
          {dirtyTabs.has(TAB_SPECS) && <DirtyDot />}
        </span>
      ),
    },
  ];

  return (
    <Tabs tabs={tabs} defaultValue={TAB_GENERAL} keepMounted>
      {/* Thông tin chung */}
      <TabPanel value={TAB_GENERAL} className="pt-5">
        <ProductGeneralForm
          value={generalData}
          onChange={(v) => {
            setGeneralData(v);
            markDirty(TAB_GENERAL);
          }}
        />
      </TabPanel>

      {/* Biến thể */}
      <TabPanel value={TAB_VARIANTS} className="pt-5">
        <ProductVariantsForm
          attributes={attributes}
          variants={variants}
          onAttributesChange={(attrs) => {
            setAttributes(attrs);
            markDirty(TAB_VARIANTS);
          }}
          onVariantsChange={(v) => {
            setVariants(v);
            markDirty(TAB_VARIANTS);
          }}
        />
      </TabPanel>

      {/* Hình ảnh */}
      <TabPanel value={TAB_IMAGES} className="pt-5">
        <MediaUploadPanel
          images={[]}
          onAdd={() => {}}
          onRemove={() => {}}
        />
      </TabPanel>

      {/* SEO */}
      <TabPanel value={TAB_SEO} className="pt-5">
        <ProductSEOForm
          value={seoData}
          onChange={(v) => {
            setSeoData(v);
            markDirty(TAB_SEO);
          }}
          productName={generalData.name}
        />
      </TabPanel>

      {/* Thông số kỹ thuật */}
      <TabPanel value={TAB_SPECS} className="pt-5">
        <ProductSpecificationsForm
          specs={specs}
          onChange={(s) => {
            setSpecs(s);
            markDirty(TAB_SPECS);
          }}
        />
      </TabPanel>
    </Tabs>
  );
}
