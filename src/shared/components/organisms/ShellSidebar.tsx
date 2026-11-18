import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/shared/components/atoms/Logo";
import AdSlot from "@/shared/components/molecules/AdSlot";
import { SidebarNav, type ShellNavItem } from "@/shared/components/molecules/ShellNav";
import ThemeToggle from "@/shared/components/molecules/ThemeToggle";

interface ShellSidebarProps {
  items: ShellNavItem[];
  user: { avatar: string; name: string; subtitle: string };
  onLogout: () => void;
}

export default function ShellSidebar({ items, user, onLogout }: ShellSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col justify-between w-60 xl:w-64 shrink-0 sticky top-0 h-screen px-4 py-5">
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <Link href="/" aria-label="Editaliza, página inicial" className="inline-flex items-center px-3 py-1.5">
          <Logo />
        </Link>

        <SidebarNav items={items} />

        {/* Publicidade entre o último item do menu (Configurações) e o perfil: ocupa a altura
            que sobra, até a linha que separa o cartão do usuário */}
        <div className="min-h-0 flex-1 pb-4">
          <AdSlot variant="sidebar" slot={1} />
        </div>
      </div>

      <div className="border-t border-(--border-subtle) pt-4 space-y-2">
        <Link
          href="/perfil"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-(--surface-subtle) transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border border-(--border-subtle) shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-(--foreground) truncate">{user.name}</p>
            <p className="text-xs text-(--text-subtle) truncate">{user.subtitle}</p>
          </div>
        </Link>

        <ThemeToggle
          showLabel
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-(--text-muted) hover:bg-(--surface-subtle) hover:text-(--foreground) transition-colors cursor-pointer"
        />

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-(--text-muted) hover:bg-(--danger-soft) hover:text-(--danger) transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}
