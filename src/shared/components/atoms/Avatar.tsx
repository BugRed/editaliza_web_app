import { joinClassNames } from "@/shared/lib/cn";

type AvatarProps = { name: string; src?: string; className?: string };

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, src, className }: AvatarProps) {
  const base = "inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-pill";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- origem arbitrária; next/image exigiria domínios fixos
    return <img src={src} alt={name} className={joinClassNames(base, "object-cover", className)} />;
  }
  return (
    <span
      role="img"
      aria-label={name}
      className={joinClassNames(base, "bg-primary-soft text-sm font-medium text-primary", className)}
    >
      {getInitials(name)}
    </span>
  );
}
