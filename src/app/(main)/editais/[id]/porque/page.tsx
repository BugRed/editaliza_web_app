"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/shared/components/organisms/AppShell";
import WhyScoreView from "@/shared/components/organisms/WhyScoreView";
import { useRankedEditals } from "@/app/hooks/useRankedEditals";

export default function PorQuePage() {
  const params = useParams<{ id: string }>();
  const { items, loading } = useRankedEditals();
  const item = items.find((entry) => String(entry.edital.id) === params.id);

  return (
    <AppShell title="Por que essa nota">
      {loading ? (
        <p role="status" className="p-12 text-center text-sm text-(--text-muted)">
          Carregando a nota...
        </p>
      ) : !item ? (
        <div className="p-12 text-center space-y-3">
          <p className="text-sm text-(--text-muted)">Não encontramos este edital entre as suas recomendações.</p>
          <Link href="/" className="text-sm font-semibold text-(--primary-fg) hover:underline">
            Voltar ao início
          </Link>
        </div>
      ) : (
        <WhyScoreView editalTitle={item.edital.title} editalId={item.edital.id} rank={item.rank} />
      )}
    </AppShell>
  );
}
