import Link from "next/link";

import { Badge } from "@/shared/components/atoms/Badge";

type EditalCardProps = {
  href?: string;
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
          <CardTitle href={href} title={title} />
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

const EXTERNAL_LINK = /^https?:\/\//;

function CardTitle({ href, title }: { href?: string; title: string }) {
  if (!href) return <>{title}</>;
  if (EXTERNAL_LINK.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
        {title}
      </a>
    );
  }
  return (
    <Link href={href} className="hover:text-primary">
      {title}
    </Link>
  );
}
