"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link, { type LinkProps } from "next/link";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Visual style variant of the button */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "warning" | "success";

/** Size of the button */
export type ButtonSize = "xs" | "sm" | "md" | "lg";

/**
 * Color theme for the `outline` variant.
 * Has no effect on other variants.
 * @default "primary"
 */
export type ButtonColor = "primary" | "secondary" | "danger" | "warning" | "success";

interface ButtonBaseProps {
  /** Visual style variant
   * @default "primary"
   */
  variant?: ButtonVariant;
  /**
   * Color theme — only applies when `variant="outline"`.
   * @default "primary"
   */
  color?: ButtonColor;
  /** Button size
   * @default "md"
   */
  size?: ButtonSize;
  /** Shows a spinner and disables the button while a promise is resolving
   * @default false
   */
  isLoading?: boolean;
  /** Icon rendered to the left of the label. Use 16×16 SVG icons. */
  leftIcon?: ReactNode;
  /** Icon rendered to the right of the label. Use 16×16 SVG icons. */
  rightIcon?: ReactNode;
  /** Stretches the button to fill its container width
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Disables the button. When `href` is set, applies visual disabled styles
   * and prevents navigation via `aria-disabled`.
   * @default false
   */
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

/** Button rendered as a native <button> element */
export type ButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

/** Button rendered as a Next.js <Link> — same visual appearance, navigates on click */
export type ButtonLinkProps = ButtonBaseProps & Omit<LinkProps, "className"> & { href: string };

// ─── Style maps ───────────────────────────────────────────────────────────────

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium rounded transition-all duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 text-white shadow-sm " +
    "hover:bg-primary-700 active:bg-primary-800 " +
    "focus-visible:ring-primary-500",

  secondary:
    "bg-secondary-100 text-secondary-700 border border-secondary-200 " +
    "hover:bg-secondary-200 active:bg-secondary-300 " +
    "focus-visible:ring-secondary-400",

  ghost:
    "bg-transparent text-secondary-600 " +
    "hover:bg-secondary-100 active:bg-secondary-200 " +
    "focus-visible:ring-secondary-400",

  danger:
    "bg-error-600 text-white shadow-sm " +
    "hover:bg-error-700 active:bg-error-800 " +
    "focus-visible:ring-error-500",
  
  warning:
    "bg-warning-600 text-white shadow-sm " +
    "hover:bg-warning-700 active:bg-warning-800 " +
    "focus-visible:ring-warning-500",
  
  success:
    "bg-success-600 text-white shadow-sm " +
    "hover:bg-success-700 active:bg-success-800 " +
    "focus-visible:ring-success-500",

  // Outline variant is handled separately since it has a different structure

  // Base outline styles — color is injected via OUTLINE_COLOR
  outline: "bg-transparent border",
};

/** Color-specific styles applied on top of the base `outline` variant */
const OUTLINE_COLOR: Record<ButtonColor, string> = {
  primary:
    "text-primary-600 border-primary-400 " +
    "hover:bg-primary-50 active:bg-primary-100 " +
    "focus-visible:ring-primary-500",

  secondary:
    "text-secondary-600 border-secondary-400 " +
    "hover:bg-secondary-50 active:bg-secondary-100 " +
    "focus-visible:ring-secondary-400",

  danger:
    "text-error-600 border-error-400 " +
    "hover:bg-error-50 active:bg-error-100 " +
    "focus-visible:ring-error-500",

  warning:
    "text-warning-600 border-warning-400 " +
    "hover:bg-warning-50 active:bg-warning-100 " +
    "focus-visible:ring-warning-500",

  success:
    "text-success-600 border-success-400 " +
    "hover:bg-success-50 active:bg-success-100 " +
    "focus-visible:ring-success-500",
};

const SIZE: Record<ButtonSize, string> = {
  xs: "h-7  px-2.5 text-xs",
  sm: "h-8  px-3   text-sm",
  md: "h-10 px-4   text-sm",
  lg: "h-12 px-6   text-base",
};

/** Icon wrapper size aligned with each button size */
const ICON_SIZE: Record<ButtonSize, string> = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

// ─── Shared inner content ─────────────────────────────────────────────────────

function ButtonContent({
  isLoading,
  size,
  leftIcon,
  rightIcon,
  children,
}: {
  isLoading: boolean;
  size: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      {isLoading ? (
        <ArrowPathIcon className={`${ICON_SIZE[size]} animate-spin`} aria-hidden="true" />
      ) : (
        leftIcon && (
          <span className={`${ICON_SIZE[size]} flex shrink-0 items-center`} aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}

      {children}

      {!isLoading && rightIcon && (
        <span className={`${ICON_SIZE[size]} flex shrink-0 items-center`} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Button — primary interactive element. Supports two rendering modes:
 * - **Button** (default): renders a native `<button>` element.
 * - **Link**: pass `href` to render a Next.js `<Link>` with identical visual styles.
 *
 * ```tsx
 * // Native button
 * <Button onClick={handleSave} leftIcon={<SaveIcon />}>Lưu</Button>
 *
 * // Link button — navigates on click
 * <Button href="/inventory" variant="secondary" leftIcon={<ArrowLeftIcon />}>Quay lại</Button>
 *
 * // Outline with color theme
 * <Button variant="outline" color="danger">Xoá</Button>
 * <Button variant="outline" color="warning">Cảnh báo</Button>
 * <Button variant="outline" color="success">Xác nhận</Button>
 *
 * // Loading state
 * <Button isLoading>Đang xử lý…</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps | ButtonLinkProps>(function Button(
  props,
  ref
) {
  const {
    variant = "primary",
    color = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled = false,
    children,
    className = "",
    href,
    ...rest
  } = props;

  const variantClass =
    variant === "outline"
      ? `${VARIANT.outline} ${OUTLINE_COLOR[color]}`
      : VARIANT[variant];

  const isDisabled = disabled || isLoading;

  const resolvedClassName = [
    BASE,
    variantClass,
    SIZE[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <ButtonContent isLoading={isLoading} size={size} leftIcon={leftIcon} rightIcon={rightIcon}>
      {children}
    </ButtonContent>
  );

  if (href !== undefined) {
    return (
      <Link
        href={href}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        className={[resolvedClassName, isDisabled ? "pointer-events-none opacity-50" : ""].filter(Boolean).join(" ")}
        {...(rest as Omit<LinkProps, "href" | "className">)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={resolvedClassName}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
});

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name        Type                                       Default      Description
 * ──────────────────────────────────────────────────────────────────────────────
 * href        string                                     —            If set, renders as Next.js Link
 * variant     "primary"|"secondary"|"ghost"|             "primary"    Visual style
 *             "danger"|"outline"
 * color       "primary"|"secondary"|"danger"|            "primary"    Color theme (outline only)
 *             "warning"|"success"
 * size        "xs"|"sm"|"md"|"lg"                        "md"         Dimensions
 * isLoading   boolean                                    false        Spinner + disabled
 * leftIcon    ReactNode                                  —            Left icon slot
 * rightIcon   ReactNode                                  —            Right icon slot
 * fullWidth   boolean                                    false        100% width
 * disabled    boolean                                    false        Native disabled (button only)
 * onClick     React.MouseEventHandler<HTMLButtonElement> —            Click handler (button only)
 * className   string                                     ""           Extra Tailwind classes
 * children    ReactNode                                  —            Button label/content
 *
 * All native <button> or Next.js <Link> props are also supported via spread.
 */
