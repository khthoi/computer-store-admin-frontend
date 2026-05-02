"use client";

import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  useTransitionStyles,
  FloatingPortal,
  type Placement,
} from "@floating-ui/react";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type RefCallback,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TooltipPlacement = Placement;

export interface TooltipProps {
  /** Tooltip text or JSX */
  content: ReactNode;
  /**
   * Preferred placement relative to the trigger.
   * Auto-flips when near a viewport edge.
   * @default "top"
   */
  placement?: TooltipPlacement;
  /**
   * Gap between trigger and tooltip panel (px).
   * @default 8
   */
  offsetPx?: number;
  /**
   * Hover open delay (ms).
   * @default 200
   */
  delay?: number;
  /**
   * Max width of the tooltip panel. Only takes effect when `multiline` is true.
   * @default "280px"
   */
  maxWidth?: string;
  /**
   * Allow tooltip content to wrap across multiple lines.
   * When false (default) content stays on one line.
   * When true, content wraps at `maxWidth` (default 280 px).
   * @default false
   */
  multiline?: boolean;
  /** Disable the tooltip entirely */
  disabled?: boolean;
  /**
   * When true, Floating UI anchors to an inline `<span>` wrapping the
   * *content inside* the child element instead of the element itself.
   *
   * Use this when the child is a block/max-width container (e.g. a truncated
   * `<p>` or `<td>`) so the tooltip positions over the actual text rather than
   * over the full-width box.
   *
   * ```tsx
   * <Tooltip content="Full long name here" anchorToContent>
   *   <p className="truncate max-w-[200px]">Full long name here</p>
   * </Tooltip>
   * ```
   */
  anchorToContent?: boolean;
  /**
   * When true, clicking the tooltip panel copies `content` (as plain text)
   * to the clipboard. A ✓ indicator is shown for ~3.5 s then resets.
   * Rapid re-clicks restart the timer so the user can copy multiple times.
   * @default false
   */
  copy?: boolean;
  /**
   * Trigger element. Must be a single React element so Floating UI can
   * attach its ref directly to the real DOM node (native HTML elements and
   * `forwardRef` components both work).
   */
  children: ReactElement;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Tooltip — portal-rendered, Floating UI–positioned tooltip.
 *
 * Renders into `document.body` via `FloatingPortal` so it can never be
 * clipped by `overflow-hidden`, `transform`, `filter`, or z-index
 * stacking contexts in ancestor elements.
 *
 * ```tsx
 * <Tooltip content="Thêm vào giỏ hàng">
 *   <button onClick={handleCart}>
 *     <ShoppingCartIcon className="h-4 w-4" />
 *   </button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  placement = "top",
  offsetPx = 8,
  delay = 50,
  maxWidth = "280px",
  multiline = false,
  disabled = false,
  anchorToContent = false,
  copy = false,
  children,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const arrowRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); };
  }, []);

  function handleCopy() {
    const text = typeof content === "string" ? content : String(content ?? "");
    navigator.clipboard.writeText(text).catch(() => {});
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    setCopied(true);
    copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
  }

  const {
    refs,
    floatingStyles,
    context,
    middlewareData,
    placement: resolvedPlacement,
  } = useFloating({
    open,
    onOpenChange: disabled ? undefined : setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetPx),
      flip({ fallbackAxisSideDirection: "start", padding: 6 }),
      shift({ padding: 6 }),
      arrow({ element: arrowRef }),
    ],
  });

  const hover = useHover(context, { move: false, delay: { open: delay, close: 0 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  // Fade + slight translate animation
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    initial: { opacity: 0, transform: "scale(0.94)" },
    open: { opacity: 1, transform: "scale(1)" },
    close: { opacity: 0, transform: "scale(0.94)" },
    duration: 120,
  });

  // Arrow positioning — point towards the trigger element
  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;
  const arrowSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[resolvedPlacement.split("-")[0]] as "top" | "right" | "bottom" | "left";

  // Build the trigger element.
  //
  // Default: inject ref + interaction props into the child element directly —
  // Floating UI measures that DOM node.
  //
  // anchorToContent=true: keep the outer element untouched (for layout /
  // truncation) and wrap its inner children in an inline <span> that carries
  // the ref. Floating UI then measures only the text bounding box, so the
  // tooltip appears centred over the actual content rather than the full-width
  // container.
  let trigger: ReactNode;

  if (anchorToContent && isValidElement(children)) {
    const childEl = children as ReactElement<Record<string, unknown>>;
    const innerAnchor = (
      <span
        ref={refs.setReference as RefCallback<HTMLSpanElement>}
        style={{ display: "inline" }}
      >
        {childEl.props.children as ReactNode}
      </span>
    );
    // Hover events go on the outer element so the full hover area (including
    // empty space after truncated text) triggers the tooltip. The inner span
    // carries only the positioning ref so Floating UI anchors to the text
    // bounding box rather than the full-width container.
    trigger = cloneElement(
      childEl,
      { ...getReferenceProps(), ...(copy ? { onClick: handleCopy } : {}) },
      innerAnchor,
    );
  } else {
    trigger = isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          ref: refs.setReference,
          ...getReferenceProps(),
          ...(copy ? { onClick: handleCopy } : {}),
        })
      : children;
  }

  return (
    <>
      {trigger}

      {/* Portal — escapes any overflow-hidden / transform / z-index parent */}
      <FloatingPortal>
        {isMounted && !disabled && content && (
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 9999 }}
            {...getFloatingProps()}
            className="pointer-events-auto"
          >
            <div
              style={{ ...transitionStyles, ...(multiline ? { maxWidth } : {}) }}
              className={[
                "rounded-md bg-secondary-900 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg",
                multiline
                  ? "whitespace-normal break-words leading-snug"
                  : "whitespace-nowrap leading-none",
              ].join(" ")}
            >
              {copy ? (
                <span className="flex items-center gap-1.5">
                  {copied ? (
                    <>
                      <span aria-hidden="true">✓</span>
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <span>{content}</span>
                      <span aria-hidden="true" className="opacity-60 text-[10px]">⎘</span>
                    </>
                  )}
                </span>
              ) : content}
            </div>
          </div>
        )}
      </FloatingPortal>
    </>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name       Type              Default   Description
 * ─────────────────────────────────────────────────────────────────────────────
 * content    ReactNode         required  Tooltip text / JSX
 * placement  Placement         "top"     Preferred side; auto-flips near edges
 * offsetPx   number            8         Gap between trigger and panel (px)
 * delay      number            200       Hover open delay (ms)
 * multiline  boolean           false     Wrap content across lines at maxWidth
 * maxWidth   string            "280px"   Max panel width (only when multiline)
 * disabled   boolean           false     Suppress tooltip entirely
 * children   ReactNode         required  The element that triggers the tooltip
 */
