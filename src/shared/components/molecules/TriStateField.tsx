import type { TriState } from "@/shared/lib/onboarding";

interface TriStateFieldProps {
  name: string;
  label: string;
  value: TriState;
  onChange: (value: TriState) => void;
}

const OPTIONS: { value: TriState; label: string }[] = [
  { value: "yes", label: "Sim" },
  { value: "no", label: "Não" },
  { value: "unknown", label: "Prefiro não dizer" },
];

export default function TriStateField({ name, label, value, onChange }: TriStateFieldProps) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-bold text-(--foreground)">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className="inline-flex items-center gap-2 rounded-lg border border-(--border-subtle) px-3 py-1.5 text-sm text-(--foreground) cursor-pointer has-[:checked]:border-(--primary-fg) has-[:checked]:bg-(--primary-soft)"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="accent-(--primary-fg)"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
