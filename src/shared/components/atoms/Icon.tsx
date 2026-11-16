import type { LucideIcon } from "lucide-react";

type IconProps = { icon: LucideIcon; label?: string; size?: number; className?: string };

// Decorativo por padrão: só anuncia quando recebe `label`.
export function Icon({ icon: Glyph, label, size = 20, className }: IconProps) {
  return (
    <Glyph
      size={size}
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}
