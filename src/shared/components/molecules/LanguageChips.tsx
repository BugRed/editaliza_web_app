import { X } from "lucide-react";

type ChipVariant = "core" | "support";

interface LanguageChipsProps {
  title: string;
  hint?: string;
  tags: string[];
  selected: string[];
  variant: ChipVariant;
  onToggle: (tag: string) => void;
}

const SELECTED_CLASS: Record<ChipVariant, string> = {
  core: "bg-(--primary) border-(--primary-fg) text-white",
  support: "bg-(--accent) border-(--accent) text-(--on-accent)",
};

const IDLE_CLASS: Record<ChipVariant, string> = {
  core: "bg-(--bg-card) border-(--border-subtle) text-(--text-muted) hover:border-(--primary-fg)",
  support: "bg-(--bg-card) border-(--border-subtle) text-(--text-muted) hover:border-(--accent)",
};

export default function LanguageChips({
  title,
  hint,
  tags,
  selected,
  variant,
  onToggle,
}: LanguageChipsProps) {
  return (
    <div>
      <p className="block text-sm font-bold text-(--foreground)">{title}</p>
      {hint && <p className="text-xs text-(--text-subtle)">{hint}</p>}
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag) => {
          const isSelected = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(tag)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isSelected ? SELECTED_CLASS[variant] : IDLE_CLASS[variant]
              }`}
            >
              <span>{tag}</span>
              {isSelected && <X size={13} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
