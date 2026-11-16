import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { joinClassNames } from "@/shared/lib/cn";

type NavItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  count?: number;
  variant?: "side" | "bottom";
};

export function NavItem({ href, label, icon: Glyph, active = false, count, variant = "side" }: NavItemProps) {
  const hasCount = typeof count === "number" && count > 0;

  if (variant === "bottom") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={joinClassNames(
          "relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium",
          active ? "font-bold text-primary" : "text-ink-muted",
        )}
      >
        <Glyph size={20} aria-hidden="true" />
        <span>{label}</span>
        {hasCount && (
          <span className="absolute right-1.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent px-1 text-[10px] font-bold text-on-accent">
            {count}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={joinClassNames(
        "flex items-center justify-between whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[15px] transition-colors",
        active ? "bg-primary-soft font-bold text-primary" : "font-medium text-ink hover:bg-surface-subtle",
      )}
    >
      <span className="flex items-center gap-3.5">
        <Glyph size={21} strokeWidth={active ? 2.4 : 1.9} className={active ? "text-primary" : "text-ink-muted"} aria-hidden="true" />
        {label}
      </span>
      {hasCount && (
        <span className="rounded-pill bg-accent px-2 py-0.5 text-xs font-bold tabular-nums text-on-accent">{count}</span>
      )}
    </Link>
  );
}
