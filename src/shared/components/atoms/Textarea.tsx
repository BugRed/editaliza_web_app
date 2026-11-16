import type { TextareaHTMLAttributes } from "react";

import { FIELD_CLASSES, getFieldBorderClass } from "@/shared/components/atoms/fieldStyles";
import { joinClassNames } from "@/shared/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function Textarea({ invalid = false, className, ...rest }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={joinClassNames(FIELD_CLASSES, getFieldBorderClass(invalid), "min-h-24 py-2", className)}
      {...rest}
    />
  );
}
