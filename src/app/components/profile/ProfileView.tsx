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
    <div className="divide-y divide-[#DCE6E8]">
      {/* Topo do perfil: foto à esquerda + dados e tags do lado */}
      <section className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Foto do usuário no topo */}
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatarUrl}
              alt={`Foto de ${profile.name}`}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-[#0E7C86] bg-[#F0F6F7]"
            />
          </div>

          {/* Ao lado da foto: nome, bio e TODAS as tags que o artista faz */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-[#102A30] leading-tight">
                  {profile.name}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6B8388] mt-0.5">
                  <span>{profile.handle}</span>
                  {(profile.city || profile.state) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} aria-hidden="true" />
                      {[profile.city, profile.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                  <span className="text-xs font-medium text-[#09585F]">
                    {SCOPE_LABELS[profile.territoryScope] ?? profile.territoryScope}
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <Link
                  href="/configuracoes"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#DCE6E8] bg-white hover:bg-[#F0F6F7] text-sm font-semibold text-[#102A30] transition-colors shrink-0"
                >
                  <Settings size={15} />
                  <span>Configurar perfil</span>
                </Link>
              )}
            </div>

            <p className="text-sm text-[#4A656B] leading-relaxed">
              {profile.bio}
            </p>

            {/* Metadados de trajetória e elegibilidade usados pelo ArtistRank */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A656B]">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F8FAFB] border border-[#DCE6E8] font-medium">
                <Briefcase size={12} className="text-[#0E7C86]" />
                {LEVEL_LABELS[profile.profileLevel] ?? profile.profileLevel} ·{" "}
                {profile.experienceYears}{" "}
                {profile.experienceYears === 1 ? "ano" : "anos"} de prática
              </span>
              {profile.hasCnpjOrMei && (
                <span className="px-2.5 py-1 rounded-md bg-[#F8FAFB] border border-[#DCE6E8] font-medium">
                  CNPJ / MEI ativo
                </span>
              )}
              {profile.hasTechnicalFormation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F8FAFB] border border-[#DCE6E8] font-medium">
                  <GraduationCap size={13} className="text-[#0E7C86]" />
                  Formação técnica
                </span>
              )}
            </div>

            {/* Todas as tags artísticas ao lado da foto */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6B8388]">
                Linguagens e áreas de atuação
              </p>
              <div className="flex flex-wrap gap-2">
                {coreTags.map((tag) => (
                  <span
                    key={`core-${tag}`}
                    title="Linguagem principal (núcleo)"
                    className="px-3 py-1 rounded-lg bg-[#E6F4F5] border border-[#CBE5E8] text-[#09585F] text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))}
                {supportTags.map((tag) => (
                  <span
                    key={`sup-${tag}`}
                    title="Linguagem de suporte"
                    className="px-3 py-1 rounded-lg bg-[#FFF8E1] border border-[#F5D67B] text-[#7A5400] text-xs font-semibold"
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
      <section className="p-5 sm:p-6 bg-[#F8FAFB]/60">
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-[#0E7C86]" aria-hidden="true" />
            <h3 className="text-sm font-bold text-[#102A30]">
              Badges conquistadas em editais
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#6B8388] tabular-nums">
            {profile.badges.length} {profile.badges.length === 1 ? "conquista" : "conquistas"}
          </span>
        </div>

        {profile.badges.length === 0 ? (
          <p className="text-sm text-[#6B8388]">
            Nenhuma badge conquistada ainda. Ao ser aprovado em um edital, a conquista aparece aqui.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.badges.map((badge) => (
              <Link
                key={badge.id}
                href={`/perfil/${profile.id}/selos/${badge.id}`}
                aria-label={`Ver o selo ${badge.title}: ${badge.editalName}`}
                className="group flex items-start gap-3 rounded-xl border border-[#DCE6E8] bg-white p-3.5 transition-colors hover:border-[#0E7C86]/50 hover:bg-[#F8FAFB]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FFB800]/50 bg-[#FFF6D6] text-[#7A5400]">
                  <Award size={20} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-bold text-[#0E7C86]">{badge.title}</span>
                    <span className="text-xs tabular-nums text-[#6B8388]">· {badge.year}</span>
                  </div>
                  <p className="mt-0.5 break-words text-sm font-bold leading-snug text-[#102A30]">{badge.editalName}</p>
                  <p className="mt-0.5 text-xs text-[#6B8388]">
                    Área: {badge.category}
                    {badge.issuerName ? ` · ${badge.issuerName}` : ""}
                  </p>
                </div>
                <ChevronRight size={16} className="mt-1 shrink-0 text-[#6B8388] group-hover:text-[#0E7C86]" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Galeria de trabalhos artísticos (estilo Instagram) */}
      <section className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-[#102A30]">
            Trabalhos artísticos ({profile.works.length})
          </h3>
          {isOwnProfile && (
            <Link
              href="/configuracoes#novo-trabalho"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0E7C86] hover:underline"
            >
              <Plus size={14} />
              <span>Adicionar obra</span>
            </Link>
          )}
        </div>

        {profile.works.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#DCE6E8] p-8 text-center">
            <p className="text-sm text-[#6B8388]">Nenhum trabalho artístico publicado ainda.</p>
          </div>
        ) : (
          <WorkGallery works={profile.works} />
        )}
      </section>

    </div>
  );
}
