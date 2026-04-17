import { EnvelopeIcon, DevicePhoneMobileIcon, BellIcon } from "@heroicons/react/24/outline";
import type { NotificationChannel } from "@/src/types/notification.types";

// ─── Config ───────────────────────────────────────────────────────────────────

const CHANNEL_CONFIG: Record<
  NotificationChannel,
  { label: string; icon: React.ReactNode; className: string }
> = {
  Email: {
    label: "Email",
    icon: <EnvelopeIcon className="h-3 w-3" aria-hidden />,
    className: "bg-primary-50 text-primary-600",
  },
  SMS: {
    label: "SMS",
    icon: <DevicePhoneMobileIcon className="h-3 w-3" aria-hidden />,
    className: "bg-violet-50 text-violet-600",
  },
  Push: {
    label: "Push",
    icon: <BellIcon className="h-3 w-3" aria-hidden />,
    className: "bg-amber-50 text-amber-600",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationChannelBadgeProps {
  channel: NotificationChannel;
  size?: "sm" | "md";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationChannelBadge({
  channel,
  size = "md",
}: NotificationChannelBadgeProps) {
  const cfg = CHANNEL_CONFIG[channel];
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs",
        cfg.className,
      ].join(" ")}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
