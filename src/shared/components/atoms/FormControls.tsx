import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

// Uma só aparência para todo campo de formulário: antes cada tela repetia esta lista de classes.
const FIELD_CLASS =
  "w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)";

function joinClass(extra?: string): string {
  return extra ? `${FIELD_CLASS} ${extra}` : FIELD_CLASS;
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={joinClass(className)} />;
}

export function SelectInput({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={joinClass(className)} />;
}

export function TextAreaInput({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={joinClass(className)} />;
}
