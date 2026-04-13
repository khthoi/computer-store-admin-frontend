import { Badge } from "@/src/components/ui/Badge";
import type { BadgeVariant } from "@/src/components/ui/Badge";
import type { RfmSegment } from "@/src/types/report.types";

// ─── Config ───────────────────────────────────────────────────────────────────

const SEGMENT_VARIANT: Record<RfmSegment, BadgeVariant> = {
  Champions:   "success",
  Loyal:       "primary",
  "At Risk":   "warning",
  New:         "info",
  Hibernating: "default",
  Lost:        "error",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface RfmSegmentBadgeProps {
  segment: RfmSegment;
}

export function RfmSegmentBadge({ segment }: RfmSegmentBadgeProps) {
  return (
    <Badge variant={SEGMENT_VARIANT[segment]} size="sm" dot>
      {segment}
    </Badge>
  );
}
