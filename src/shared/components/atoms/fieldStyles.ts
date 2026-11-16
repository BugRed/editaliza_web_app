export const FIELD_CLASSES =
  "w-full rounded-lg bg-bg px-4 text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50";

export function getFieldBorderClass(invalid: boolean): string {
  return invalid ? "border border-danger" : "border border-line";
}
