export const FIELD_CLASSES =
  "w-full rounded-md border bg-surface px-3 text-ink placeholder:text-ink-muted disabled:opacity-50";

export function getFieldBorderClass(invalid: boolean): string {
  return invalid ? "border-danger" : "border-line";
}
