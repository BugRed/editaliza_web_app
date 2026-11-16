import { Search } from "lucide-react";

import { Icon } from "@/shared/components/atoms/Icon";

type SearchBarProps = { action: string; name?: string; defaultValue?: string; placeholder?: string };

// GET puro: a busca vira URL compartilhável e funciona sem JavaScript.
export function SearchBar({ action, name = "q", defaultValue, placeholder = "Buscar editais" }: SearchBarProps) {
  return (
    <form role="search" action={action} method="get" className="relative">
      <label htmlFor="search-bar-input" className="sr-only">
        {placeholder}
      </label>
      <Icon icon={Search} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
      <input
        id="search-bar-input"
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 w-full rounded-pill border border-line bg-surface pl-10 pr-4 text-ink placeholder:text-ink-muted"
      />
    </form>
  );
}
