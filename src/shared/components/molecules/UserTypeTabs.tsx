import { Building2, Palette } from "lucide-react";
import type { SignupUserType } from "@/shared/lib/signup-validation";

interface UserTypeTabsProps {
  value: SignupUserType;
  onChange: (type: SignupUserType) => void;
}

const BASE = "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-colors cursor-pointer";

export default function UserTypeTabs({ value, onChange }: UserTypeTabsProps) {
  return (
    <div role="tablist" aria-label="Tipo de cadastro" className="grid grid-cols-2 gap-2.5 mb-6">
      <button
        type="button"
        role="tab"
        aria-selected={value === "ARTIST"}
        onClick={() => onChange("ARTIST")}
        className={`${BASE} ${
          value === "ARTIST"
            ? "bg-(--primary-soft) border-(--primary-fg) text-(--primary-fg)"
            : "bg-(--background) border-(--border-subtle) text-(--text-muted) hover:border-(--primary-fg)"
        }`}
      >
        <Palette size={18} />
        <span>Sou Artista</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "PROPOSER"}
        onClick={() => onChange("PROPOSER")}
        className={`${BASE} ${
          value === "PROPOSER"
            ? "bg-(--accent-soft) border-(--accent) text-(--accent-ink)"
            : "bg-(--background) border-(--border-subtle) text-(--text-muted) hover:border-(--accent)"
        }`}
      >
        <Building2 size={18} />
        <span>Sou Propositor</span>
      </button>
    </div>
  );
}
