import type { InputHTMLAttributes } from "react";

import { joinClassNames } from "@/shared/lib/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string };

export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={joinClassNames("inline-flex items-center gap-2 text-ink", className)}>
      <input type="checkbox" className="size-4 accent-primary" {...rest} />
      <span>{label}</span>
    </label>
  );
}
