import { joinClassNames } from "@/shared/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={joinClassNames("animate-pulse rounded-xl bg-surface-subtle", className)}
    />
  );
}
