import Link from "next/link";

import { Badge } from "@/shared/components/atoms/Badge";

type EditalCardProps = {
  href: string;
  title: string;
  organization: string;
  deadlineLabel: string;
  tags: string[];
};

// Sem score: a UI não mostra compatibilidade até o motor existir (O4).
export function EditalCard({ href, title, organization, deadlineLabel, tags }: EditalCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-lg bg-surface p-5 shadow-card">
      <div>
        <h3 className="text-lg font-semibold text-ink">
          <Link href={href} className="hover:text-primary">
            {title}
          </Link>
        </h3>
        <p className="text-sm text-ink-muted">{organization}</p>
      </div>
      <p className="text-sm text-ink">{deadlineLabel}</p>
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Tags">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge tone="primary">{tag}</Badge>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
