"use client";

import Link                   from "next/link";
import { KpiCardGrid }        from "../KpiCardGrid";
import { SimpleAreaChart }    from "../SimpleAreaChart";
import { StockHealthDonut }   from "../StockHealthDonut";
import { DataTable }          from "../DataTable";
import { Tabs, TabPanel }     from "@/src/components/ui/Tabs";
import { Badge }              from "@/src/components/ui/Badge";
import { Tooltip }            from "@/src/components/ui/Tooltip";
import type { BadgeVariant }  from "@/src/components/ui/Badge";
import type { InventoryReport } from "@/src/types/report.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InventoryReportClientProps {
  data: InventoryReport;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BUCKET_VARIANT: Record<string, BadgeVariant> = {
  success: "success",
  warning: "warning",
  error:   "error",
  default: "default",
};

function vnd(v: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND", maximumFractionDigits: 0,
  }).format(v);
}

/** Name cell: fixed-width truncated Link with full-text Tooltip */
function NameCell({ name, href }: { name: string; href: string }) {
  return (
    <Tooltip content={name} placement="top" anchorToContent>
      <Link
        href={href}
        className="block max-w-[200px] truncate font-medium text-primary-600 hover:text-primary-700 hover:underline"
      >
        {name}
      </Link>
    </Tooltip>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InventoryReportClient({ data }: InventoryReportClientProps) {
  const lowStockRows = data.lowStockItems.map((item) => ({
    name: (
      <NameCell
        name={item.name}
        href={`/products/${item.productId}/variants/${item.variantId}`}
      />
    ),
    sku:       <span className="font-mono text-xs text-secondary-400">{item.sku}</span>,
    stock:     <span className="tabular-nums font-semibold text-error-600">{item.currentStock}</span>,
    threshold: <span className="tabular-nums text-secondary-500">{item.threshold}</span>,
    doi: (
      <span className={item.doi < 7 ? "font-bold text-error-600" : "tabular-nums"}>
        {item.doi} ngày
      </span>
    ),
  }));

  const overStockRows = [...data.overStockItems]
    .sort((a, b) => b.doi - a.doi)
    .map((item) => ({
      name: (
        <NameCell
          name={item.name}
          href={`/products/${item.productId}/variants/${item.variantId}`}
        />
      ),
      sku:            <span className="font-mono text-xs text-secondary-400">{item.sku}</span>,
      stock:          <span className="tabular-nums">{item.stock.toLocaleString("vi-VN")}</span>,
      doi:            <span className="tabular-nums text-warning-600 font-semibold">{item.doi} ngày</span>,
      estimatedValue: <span className="tabular-nums">{vnd(item.estimatedValue)}</span>,
    }));

  const bucketRows = data.stockHealthBuckets.map((b) => ({
    label: (
      <div className="flex items-center gap-2">
        <Badge variant={BUCKET_VARIANT[b.variant]} size="sm" dot>{b.label}</Badge>
      </div>
    ),
    count: <span className="tabular-nums font-semibold">{b.count}</span>,
  }));

  const TABS = [
    { value: "low",  label: "Cảnh báo thấp" },
    { value: "over", label: "Tồn kho cao"    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-secondary-900">Báo cáo Kho hàng</h1>
        <p className="text-sm text-secondary-500 mt-0.5">
          Trạng thái tồn kho hiện tại — DOI, vòng quay và cảnh báo
        </p>
      </div>

      <KpiCardGrid cards={[
        data.kpis.totalSku,
        data.kpis.outOfStock,
        data.kpis.avgDoi,
        data.kpis.turnoverRate,
      ]} />

      {/* Health donut + bucket breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockHealthDonut buckets={data.stockHealthBuckets} />
        <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-secondary-800">Chi tiết phân loại tồn kho</h3>
          <DataTable
            columns={[
              { key: "label", label: "Phân loại" },
              { key: "count", label: "Số SKU", align: "right" },
            ]}
            rows={bucketRows}
          />
        </div>
      </div>

      {/* Low / Over stock tabs */}
      <Tabs tabs={TABS} defaultValue="low">
        <TabPanel value="low" className="pt-4">
          <DataTable
            columns={[
              { key: "name",      label: "Sản phẩm"                },
              { key: "sku",       label: "SKU"                     },
              { key: "stock",     label: "Tồn kho",  align: "right" },
              { key: "threshold", label: "Ngưỡng",   align: "right" },
              { key: "doi",       label: "DOI",      align: "right" },
            ]}
            rows={lowStockRows}
          />
        </TabPanel>
        <TabPanel value="over" className="pt-4">
          <DataTable
            columns={[
              { key: "name",           label: "Sản phẩm"                   },
              { key: "sku",            label: "SKU"                        },
              { key: "stock",          label: "Tồn kho",    align: "right" },
              { key: "doi",            label: "DOI",        align: "right" },
              { key: "estimatedValue", label: "Giá trị tồn", align: "right" },
            ]}
            rows={overStockRows}
          />
        </TabPanel>
      </Tabs>

      {/* Stock movement */}
      <SimpleAreaChart
        data={data.stockMovementSeries}
        title="Biến động tồn kho (90 ngày)"
        valueUnit="count"
        color="#06b6d4"
      />
    </div>
  );
}
