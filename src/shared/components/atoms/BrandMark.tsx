import { Sun } from "lucide-react";

import { joinClassNames } from "@/shared/lib/cn";

type BrandMarkProps = { size?: "sm" | "md" | "lg"; className?: string };

const SIZE_CLASSES = { sm: "size-8 rounded-lg", md: "size-9 rounded-xl", lg: "size-12 rounded-xl" } as const;
const ICON_SIZE = { sm: 18, md: 20, lg: 26 } as const;

// Marca do protótipo: sol sobre quadrado âmbar.
export function BrandMark({ size = "md", className }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={joinClassNames(
        "flex shrink-0 items-center justify-center bg-accent text-on-accent",
        SIZE_CLASSES[size],
        className,
      )}
    >
      <Sun size={ICON_SIZE[size]} strokeWidth={2.3} />
    </span>
  );
}
