"use client";

import Link from "next/link";
import { Building2, MapPin, PlusCircle, Settings } from "lucide-react";
import type { IEdital } from "@/app/types/Edital";
import type { ProposerProfile } from "@/app/hooks/useSocialStore";
import { filterEditaisByProposer } from "@/shared/lib/edital-owner";
import EditalGalleryCard from "./EditalGalleryCard";

function formatCnpj(cnpj: string): string {
  const digits = (cnpj || "").replace(/\D/g, "");
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return cnpj || "Não informado";
}

interface ProposerProfileViewProps {
  proposer: ProposerProfile;
  editais: IEdital[];
  editaisLoading?: boolean;
  isOwnProfile: boolean;
  onOpenEdital: (edital: IEdital) => void;
}

export default function ProposerProfileView({ proposer, editais, editaisLoading = false, isOwnProfile, onOpenEdital }: ProposerProfileViewProps) {
  const published = filterEditaisByProposer(editais, proposer.id, proposer.listEdital);

  return (
    <div className="divide-y divide-(--border-subtle)">
      <section className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col items-start gap-5 sm:flex-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proposer.imgUrl}
            alt={proposer.name}
            className="h-24 w-24 shrink-0 rounded-full border-2 border-(--primary-fg) bg-(--surface-subtle) object-cover sm:h-28 sm:w-28"
          />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-md bg-(--accent-soft) px-2.5 py-0.5 text-xs font-bold text-(--accent-ink)">
                  <Building2 size={13} />
                  <span>Propositor de Editais</span>
                </span>
                <h2 className="text-xl font-bold text-(--foreground)">{proposer.name}</h2>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-(--text-subtle)">
                  <span>{proposer.handle}</span>
                  {(proposer.city || proposer.state) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} />
                      {[proposer.city, proposer.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </div>
              {isOwnProfile && (
                <Link
                  href="/configuracoes"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-(--border-subtle) bg-(--bg-card) px-3.5 py-1.5 text-sm font-semibold text-(--foreground) hover:bg-(--surface-subtle)"
                >
                  <Settings size={15} />
                  <span>Configurar perfil</span>
                </Link>
              )}
            </div>
            <p className="text-sm leading-relaxed text-(--text-muted)">{proposer.bio}</p>
            <div className="flex flex-wrap gap-2 text-xs text-(--text-muted)">
              <span className="rounded-md border border-(--border-subtle) bg-(--background) px-2.5 py-1 font-medium tabular-nums">CNPJ: {formatCnpj(proposer.cnpj)}</span>
              <span className="rounded-md border border-(--primary-border) bg-(--primary-soft) px-2.5 py-1 font-semibold tabular-nums text-(--primary-ink)">
                {published.length} {published.length === 1 ? "edital publicado" : "editais publicados"}
              </span>
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <div className="flex flex-wrap gap-3 border-t border-(--border-subtle) pt-4">
            <Link
              href="/publicar-edital"
              className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-(--primary-hover)"
            >
              <PlusCircle size={17} />
              <span>Publicar novo edital</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-(--border-subtle) px-4 py-2.5 text-sm font-semibold text-(--foreground) hover:bg-(--surface-subtle)">
              Ver editais no Início
            </Link>
          </div>
        )}
      </section>

      <section className="p-5 sm:p-6">
        <h3 className="mb-4 text-sm font-bold text-(--foreground)">Editais publicados ({published.length})</h3>
        {editaisLoading ? (
          <p className="text-sm text-(--text-subtle)">Carregando editais...</p>
        ) : published.length === 0 ? (
          <div className="rounded-xl border border-dashed border-(--border-subtle) p-8 text-center">
            <p className="text-sm text-(--text-subtle)">
              {isOwnProfile ? "Você ainda não publicou nenhum edital." : "Esta empresa ainda não publicou editais."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {published.map((edital) => (
              <EditalGalleryCard key={edital.id} edital={edital} onOpen={onOpenEdital} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
