import type { SelectHTMLAttributes } from "react";

import { FIELD_CLASSES, getFieldBorderClass } from "@/shared/components/atoms/fieldStyles";
import { joinClassNames } from "@/shared/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function Select({ invalid = false, className, ...rest }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={joinClassNames(FIELD_CLASSES, getFieldBorderClass(invalid), "h-11", className)}
      {...rest}
    />
  );
}
