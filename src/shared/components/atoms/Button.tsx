import type { ButtonHTMLAttributes } from "react";

import { Spinner } from "@/shared/components/atoms/Spinner";
import { joinClassNames } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "border border-line bg-surface text-ink hover:bg-primary-soft",
  ghost: "text-primary hover:bg-primary-soft",
  danger: "bg-danger text-on-primary hover:opacity-90",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-base",
  sm: "h-9 px-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={joinClassNames(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner label="Enviando" />}
      {children}
    </button>
  );
}
