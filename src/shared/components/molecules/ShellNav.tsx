import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface ShellNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  count?: number;
}

function hasCount(item: ShellNavItem): item is ShellNavItem & { count: number } {
  return typeof item.count === "number" && item.count > 0;
}

export function SidebarNav({ items }: { items: ShellNavItem[] }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Menu lateral">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] transition-colors whitespace-nowrap ${
              item.active
                ? "bg-(--primary-soft) text-(--primary-fg) font-bold"
                : "text-(--foreground) font-medium hover:bg-(--surface-subtle)"
            }`}
          >
            <span className="flex items-center gap-3.5">
              <Icon
                size={21}
                strokeWidth={item.active ? 2.4 : 1.9}
                className={item.active ? "text-(--primary-fg)" : "text-(--text-muted)"}
              />
              <span>{item.label}</span>
            </span>
            {hasCount(item) && (
              <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full bg-(--accent) text-(--on-accent)">
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav({ items }: { items: ShellNavItem[] }) {
  return (
    <nav
      aria-label="Navegação inferior"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-(--bg-card)/95 backdrop-blur border-t border-(--border-subtle) h-15 flex items-center justify-around px-2"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] font-medium ${
              item.active ? "text-(--primary-fg) font-bold" : "text-(--text-muted)"
            }`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
            {hasCount(item) && (
              <span className="absolute top-0.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-(--accent) text-(--on-accent) text-[10px] font-bold flex items-center justify-center tabular-nums">
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
