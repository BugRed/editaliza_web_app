import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Icon } from "@/shared/components/atoms/Icon";
import { joinClassNames } from "@/shared/lib/cn";

type NavItemProps = { href: string; label: string; icon: LucideIcon; active?: boolean };

export function NavItem({ href, label, icon, active = false }: NavItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={joinClassNames(
        "flex items-center gap-3 rounded-md px-3 py-2 font-medium",
        active ? "bg-primary-soft text-primary" : "text-ink-muted hover:bg-line-subtle",
      )}
    >
      <Icon icon={icon} />
      {label}
    </Link>
  );
}
