import type { ReactNode } from "react";

import { joinClassNames } from "@/shared/lib/cn";

type BadgeTone = "neutral" | "primary" | "accent" | "danger";

type BadgeProps = { tone?: BadgeTone; children: ReactNode; className?: string };

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-line-subtle text-ink-muted",
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-ink",
  danger: "border border-danger text-danger",
};

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={joinClassNames(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
