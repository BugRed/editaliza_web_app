import type { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}

export default function FormField({ id, label, children, className = "" }: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`.trim()}>
      <label htmlFor={id} className="block text-sm font-bold text-(--foreground)">
        {label}
      </label>
      {children}
    </div>
  );
}
