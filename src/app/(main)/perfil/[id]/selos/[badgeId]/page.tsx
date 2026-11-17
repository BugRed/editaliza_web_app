"use client";

import { use } from "react";
import Link from "next/link";
import { Award, Building2, ChevronLeft, FileText } from "lucide-react";
import AppShell from "@/shared/components/organisms/AppShell";
import { useEditals } from "@/app/hooks/useEditals";
import { useSocialStore } from "@/app/hooks/useSocialStore";

function NotFound({ message }: { message: string }) {
  return (
    <AppShell title="Selo">
      <div className="space-y-3 p-8 text-center">
        <p className="text-base font-bold text-(--foreground)">Selo não encontrado</p>
        <p className="text-sm text-(--text-muted)">{message}</p>
        <Link href="/perfil" className="inline-flex rounded-xl bg-(--primary) px-4 py-2 text-sm font-semibold text-white">
          Voltar ao perfil
        </Link>
      </div>
    </AppShell>
  );
}

export default function SeloPage({ params }: { params: Promise<{ id: string; badgeId: string }> }) {
  const { id, badgeId } = use(params);
  const { getProfileById, proposers, openEditalModal } = useSocialStore();
  const { editais } = useEditals();

  const artist = getProfileById(Number(id));
  if (!artist) return <NotFound message="O artista deste selo não existe." />;
  const badge = artist.badges.find((item) => item.id === badgeId);
  if (!badge) return <NotFound message="Este selo não está mais no perfil do artista." />;

  const edital = editais.find((item) => item.id === badge.editalId);
  const issuer = proposers.find((item) => item.id === badge.issuerId);

  return (
    <AppShell title="Selo">
      <div className="space-y-6 p-5 sm:p-6">
        <Link href={`/perfil/${artist.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-(--primary-fg) hover:underline">
          <ChevronLeft size={15} aria-hidden="true" />
          Voltar ao perfil de {artist.name}
        </Link>

        <header className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-(--accent)/50 bg-(--accent-soft) text-(--accent-ink)">
            <Award size={28} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-(--primary-fg)">
              {badge.title} · <span className="tabular-nums">{badge.year}</span>
            </p>
            <h2 className="mt-0.5 break-words text-xl font-bold leading-snug text-(--foreground)">{badge.editalName}</h2>
            <p className="mt-1 text-sm text-(--text-muted)">
              Concedido a{" "}
              <Link href={`/perfil/${artist.id}`} className="font-semibold text-(--primary-fg) hover:underline">
                {artist.name}
              </Link>{" "}
              · Área: {badge.category}
            </p>
          </div>
        </header>

        <section aria-label="Edital" className="space-y-2 rounded-xl border border-(--border-subtle) bg-(--background) p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-(--foreground)">
            <FileText size={16} className="text-(--primary-fg)" aria-hidden="true" />
            Edital que concedeu o selo
          </h3>
          {edital ? (
            <>
              <p className="text-sm font-semibold text-(--foreground)">{edital.title}</p>
              <button
                type="button"
                onClick={() => openEditalModal(edital, issuer?.name ?? "Proponente")}
                className="cursor-pointer rounded-lg bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:bg-(--primary-hover)"
              >
                Ver resumo do edital
              </button>
            </>
          ) : (
            <p className="text-sm text-(--text-subtle)">Este edital não está publicado no Editaliza (ou já foi retirado do ar).</p>
          )}
        </section>

        <section aria-label="Empresa" className="space-y-2 rounded-xl border border-(--border-subtle) bg-(--background) p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-(--foreground)">
            <Building2 size={16} className="text-(--primary-fg)" aria-hidden="true" />
            Quem concedeu
          </h3>
          {issuer ? (
            <Link href={`/empresas/${issuer.id}`} className="flex items-center gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-card) p-3 hover:border-(--primary-fg)/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={issuer.imgUrl} alt="" className="h-11 w-11 rounded-full border border-(--border-subtle) object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-(--foreground)">{issuer.name}</p>
                <p className="truncate text-xs text-(--text-subtle)">{issuer.handle} · ver editais publicados</p>
              </div>
            </Link>
          ) : (
            <p className="text-sm text-(--text-subtle)">
              {badge.issuerName ? `${badge.issuerName} não tem página no Editaliza.` : "O emissor deste selo não foi informado."}
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
