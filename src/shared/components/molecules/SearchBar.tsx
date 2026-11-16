import { Search } from "lucide-react";

type SearchBarProps = { action: string; name?: string; defaultValue?: string; placeholder?: string };

// GET puro: a busca vira URL compartilhável e funciona sem JavaScript.
export function SearchBar({ action, name = "q", defaultValue, placeholder = "Buscar editais" }: SearchBarProps) {
  return (
    <form role="search" action={action} method="get" className="relative">
      <label htmlFor="search-bar-input" className="sr-only">
        {placeholder}
      </label>
      <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
      <input
        id="search-bar-input"
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-pill border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </form>
  );
}
