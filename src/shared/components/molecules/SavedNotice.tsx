import Link from "next/link";
import { Check } from "lucide-react";

interface SavedNoticeProps {
  message: string;
  href: string;
  linkLabel: string;
}

export default function SavedNotice({ message, href, linkLabel }: SavedNoticeProps) {
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-(--primary-soft) border border-(--primary-fg)/30 text-sm text-(--primary-ink) font-medium"
    >
      <span className="inline-flex items-center gap-2">
        <Check size={16} />
        {message}
      </span>
      <Link href={href} className="font-bold underline">
        {linkLabel}
      </Link>
    </div>
  );
}
