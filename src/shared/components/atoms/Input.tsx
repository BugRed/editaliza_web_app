import type { InputHTMLAttributes } from "react";

import { FIELD_CLASSES, getFieldBorderClass } from "@/shared/components/atoms/fieldStyles";
import { joinClassNames } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function Input({ invalid = false, className, ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={joinClassNames(FIELD_CLASSES, getFieldBorderClass(invalid), "h-11", className)}
      {...rest}
    />
  );
}
