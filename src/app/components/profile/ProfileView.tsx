"use client";

import Link from "next/link";
import { Award, Briefcase, ChevronRight, GraduationCap, MapPin, Plus, Settings } from "lucide-react";
import { ArtistProfile } from "@/app/lib/user-profiles";
import WorkGallery from "./WorkGallery";

interface ProfileViewProps {
  profile: ArtistProfile;
  isOwnProfile: boolean;
}

const LEVEL_LABELS: Record<string, string> = {
  INICIANTE: "Iniciante",
  EMERGENTE: "Emergente",
  CONSOLIDADO: "Consolidado",
  MESTRE: "Mestre",
};

const SCOPE_LABELS: Record<string, string> = {
  MUNICIPAL: "Atuação municipal",
  METROPOLITANO: "Região metropolitana",
  ESTADUAL: "Atuação estadual",
  NACIONAL: "Alcance nacional",
};

export default function ProfileView({ profile, isOwnProfile }: ProfileViewProps) {
  const coreTags =
    profile.coreLanguages.length > 0 ? profile.coreLanguages : profile.tags;
  const supportTags = profile.supportLanguages.filter(
    (t) => !coreTags.includes(t)
  );

  return (
    <div className="divide-y divide-(--border-subtle)">
      {/* Topo do perfil: foto à esquerda + dados e tags do lado */}
      <section className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Foto do usuário no topo */}
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatarUrl}
              alt={`Foto de ${profile.name}`}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-(--primary-fg) bg-(--surface-subtle)"
            />
          </div>

          {/* Ao lado da foto: nome, bio e TODAS as tags que o artista faz */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-(--foreground) leading-tight">
                  {profile.name}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-(--text-subtle) mt-0.5">
                  <span>{profile.handle}</span>
                  {(profile.city || profile.state) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} aria-hidden="true" />
                      {[profile.city, profile.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                  <span className="text-xs font-medium text-(--primary-ink)">
                    {SCOPE_LABELS[profile.territoryScope] ?? profile.territoryScope}
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <Link
                  href="/configuracoes"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-(--border-subtle) bg-(--bg-card) hover:bg-(--surface-subtle) text-sm font-semibold text-(--foreground) transition-colors shrink-0"
                >
                  <Settings size={15} />
                  <span>Configurar perfil</span>
                </Link>
              )}
            </div>

            <p className="text-sm text-(--text-muted) leading-relaxed">
              {profile.bio}
            </p>

            {/* Metadados de trajetória e elegibilidade usados pelo ArtistRank */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-(--text-muted)">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-(--background) border border-(--border-subtle) font-medium">
                <Briefcase size={12} className="text-(--primary-fg)" />
                {LEVEL_LABELS[profile.profileLevel] ?? profile.profileLevel} ·{" "}
                {profile.experienceYears}{" "}
                {profile.experienceYears === 1 ? "ano" : "anos"} de prática
              </span>
              {profile.hasCnpjOrMei && (
                <span className="px-2.5 py-1 rounded-md bg-(--background) border border-(--border-subtle) font-medium">
                  CNPJ / MEI ativo
                </span>
              )}
              {profile.hasTechnicalFormation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-(--background) border border-(--border-subtle) font-medium">
                  <GraduationCap size={13} className="text-(--primary-fg)" />
                  Formação técnica
                </span>
              )}
            </div>

            {/* Todas as tags artísticas ao lado da foto */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-(--text-subtle)">
                Linguagens e áreas de atuação
              </p>
              <div className="flex flex-wrap gap-2">
                {coreTags.map((tag) => (
                  <span
                    key={`core-${tag}`}
                    title="Linguagem principal (núcleo)"
                    className="px-3 py-1 rounded-lg bg-(--primary-soft) border border-(--primary-border) text-(--primary-ink) text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))}
                {supportTags.map((tag) => (
                  <span
                    key={`sup-${tag}`}
                    title="Linguagem de suporte"
                    className="px-3 py-1 rounded-lg bg-(--accent-softer) border border-(--accent-border) text-(--accent-ink) text-xs font-semibold"
                  >
                    {tag} (suporte)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Abaixo da foto: Badges conquistadas quando passa em editais */}
      <section className="p-5 sm:p-6 bg-(--background)/60">
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-(--primary-fg)" aria-hidden="true" />
            <h3 className="text-sm font-bold text-(--foreground)">
              Badges conquistadas em editais
            </h3>
          </div>
          <span className="text-xs font-semibold text-(--text-subtle) tabular-nums">
            {profile.badges.length} {profile.badges.length === 1 ? "conquista" : "conquistas"}
          </span>
        </div>

        {profile.badges.length === 0 ? (
          <p className="text-sm text-(--text-subtle)">
            Nenhuma badge conquistada ainda. Ao ser aprovado em um edital, a conquista aparece aqui.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.badges.map((badge) => (
              <Link
                key={badge.id}
                href={`/perfil/${profile.id}/selos/${badge.id}`}
                aria-label={`Ver o selo ${badge.title}: ${badge.editalName}`}
                className="group flex items-start gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-card) p-3.5 transition-colors hover:border-(--primary-fg)/50 hover:bg-(--background)"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--accent)/50 bg-(--accent-soft) text-(--accent-ink)">
                  <Award size={20} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-bold text-(--primary-fg)">{badge.title}</span>
                    <span className="text-xs tabular-nums text-(--text-subtle)">· {badge.year}</span>
                  </div>
                  <p className="mt-0.5 break-words text-sm font-bold leading-snug text-(--foreground)">{badge.editalName}</p>
                  <p className="mt-0.5 text-xs text-(--text-subtle)">
                    Área: {badge.category}
                    {badge.issuerName ? ` · ${badge.issuerName}` : ""}
                  </p>
                </div>
                <ChevronRight size={16} className="mt-1 shrink-0 text-(--text-subtle) group-hover:text-(--primary-fg)" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Galeria de trabalhos artísticos (estilo Instagram) */}
      <section className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-(--foreground)">
            Trabalhos artísticos ({profile.works.length})
          </h3>
          {isOwnProfile && (
            <Link
              href="/configuracoes#novo-trabalho"
              className="inline-flex items-center gap-1 text-xs font-bold text-(--primary-fg) hover:underline"
            >
              <Plus size={14} />
              <span>Adicionar obra</span>
            </Link>
          )}
        </div>

        {profile.works.length === 0 ? (
          <div className="rounded-xl border border-dashed border-(--border-subtle) p-8 text-center">
            <p className="text-sm text-(--text-subtle)">Nenhum trabalho artístico publicado ainda.</p>
          </div>
        ) : (
          <WorkGallery works={profile.works} />
        )}
      </section>

    </div>
  );
}
