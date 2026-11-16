import { joinClassNames } from "@/shared/lib/cn";

type SpinnerProps = { label?: string; className?: string };

export function Spinner({ label = "Carregando", className }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={joinClassNames("inline-flex", className)}>
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-pill border-2 border-current border-t-transparent"
      />
    </span>
  );
}
