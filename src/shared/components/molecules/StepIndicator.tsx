import { joinClassNames } from "@/shared/lib/cn";

type StepIndicatorProps = { steps: string[]; currentIndex: number };

export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Etapas">
      {steps.map((step, index) => (
        <li
          key={step}
          aria-current={index === currentIndex ? "step" : undefined}
          className={joinClassNames(
            "rounded-pill px-3 py-1",
            index === currentIndex && "bg-primary text-on-primary",
            index < currentIndex && "bg-primary-soft text-primary",
            index > currentIndex && "bg-surface-subtle text-ink-muted",
          )}
        >
          {index + 1}. {step}
        </li>
      ))}
    </ol>
  );
}
