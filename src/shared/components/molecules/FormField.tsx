import { useId, type ReactNode } from "react";

type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  invalid: boolean;
};

type FormFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: (control: FieldControlProps) => ReactNode;
};

export function FormField({ label, hint, error, children }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  // Erro tem prioridade sobre a dica: o leitor de tela lê o que precisa ser corrigido.
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children({ id, "aria-describedby": describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
