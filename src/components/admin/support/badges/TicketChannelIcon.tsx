import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import type { TicketChannel } from "@/src/types/ticket.types";

interface TicketChannelIconProps {
  channel: TicketChannel;
  className?: string;
  showLabel?: boolean;
}

const CONFIG: Record<
  TicketChannel,
  { label: string; Icon: React.ElementType }
> = {
  Chat:      { label: "Chat",     Icon: ChatBubbleLeftRightIcon },
  Email:     { label: "Email",    Icon: EnvelopeIcon            },
  DienThoai: { label: "Điện thoại", Icon: PhoneIcon             },
  Form:      { label: "Form",     Icon: DocumentTextIcon        },
};

export function TicketChannelIcon({
  channel,
  className = "w-4 h-4",
  showLabel = false,
}: TicketChannelIconProps) {
  const { label, Icon } = CONFIG[channel] ?? CONFIG.Form;

  if (!showLabel) {
    return <Icon className={className} aria-label={label} title={label} />;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-secondary-500">
      <Icon className={className} aria-hidden="true" />
      {label}
    </span>
  );
}
