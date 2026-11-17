"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import AppShell from "@/app/components/shell/AppShell";
import BadgeManager from "@/app/components/profile/BadgeManager";
import WorkManager from "@/app/components/profile/WorkManager";
import { useSocialStore, ProposerProfile } from "@/app/hooks/useSocialStore";
import {
  ALL_ART_TAGS,
  ArtistProfile,
  BRAZILIAN_STATES,
} from "@/app/lib/user-profiles";
import { ProfileLevel, TerritoryScope } from "@/shared/lib/artistrank";

const PRESET_AVATARS = [
  "/images/avatar_joao_1794791579584.jpg",
  "/images/avatar_maria_1794791579527.jpg",
  "/images/avatar_carlos_1794791579626.jpg",
];

export default function ConfiguracoesPage() {
  const { currentProfile, currentProposer, isProposer, profilesLoading } =
    useSocialStore();

  return (
    <AppShell title="Configurações do perfil">
      {profilesLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--border-subtle) border-t-(--primary-fg)" />
          <p className="text-sm text-(--text-muted)">Carregando dados do perfil...</p>
        </div>
      ) : isProposer && currentProposer ? (
        <ProposerConfiguracoesContent
          key={currentProposer.id}
          proposer={currentProposer}
        />
      ) : (
        <ConfiguracoesContent
          key={`${currentProfile.id}-${currentProfile.portfolioCompleteness}`}
          currentProfile={currentProfile}
        />
      )}
    </AppShell>
  );
}

function ProposerConfiguracoesContent({
  proposer,
}: {
  proposer: ProposerProfile;
}) {
  const { updateCurrentProposer } = useSocialStore();
  const [name, setName] = useState(proposer.name);
  const [handle, setHandle] = useState(proposer.handle);
  const [cnpj, setCnpj] = useState(proposer.cnpj);
  const [city, setCity] = useState(proposer.city);
  const [stateUf, setStateUf] = useState(proposer.state);
  const [bio, setBio] = useState(proposer.bio);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateCurrentProposer({
      name: name.trim() || proposer.name,
      handle: handle.trim().startsWith("@")
        ? handle.trim()
        : `@${handle.trim() || "propositor"}`,
      cnpj: cnpj.replace(/\D/g, ""),
      city: city.trim(),
      state: stateUf.trim(),
      bio: bio.trim(),
    });
    setSaving(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  return (
    <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
      {savedNotice && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-(--primary-soft) border border-(--primary-fg)/30 text-sm text-(--primary-ink) font-medium">
          <span className="inline-flex items-center gap-2">
            <Check size={16} />
            Dados do propositor atualizados no banco.
          </span>
          <Link href="/perfil" className="font-bold underline">
            Ver perfil
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="prop-name" className="block text-sm font-bold text-(--foreground)">
            Nome da instituição
          </label>
          <input
            id="prop-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="prop-handle" className="block text-sm font-bold text-(--foreground)">
            Usuário (@)
          </label>
          <input
            id="prop-handle"
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="prop-cnpj" className="block text-sm font-bold text-(--foreground)">
            CNPJ
          </label>
          <input
            id="prop-cnpj"
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) tabular-nums focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="prop-city" className="block text-sm font-bold text-(--foreground)">
            Cidade sede
          </label>
          <input
            id="prop-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="prop-state" className="block text-sm font-bold text-(--foreground)">
            Estado (UF)
          </label>
          <select
            id="prop-state"
            value={stateUf}
            onChange={(e) => setStateUf(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
          >
            <option value="">Selecione</option>
            {BRAZILIAN_STATES.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="prop-bio" className="block text-sm font-bold text-(--foreground)">
          Sobre a organização propositora
        </label>
        <textarea
          id="prop-bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2.5 rounded-xl bg-(--primary) text-white text-sm font-bold hover:bg-(--primary-hover) disabled:opacity-60 transition-colors cursor-pointer"
      >
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}

function ConfiguracoesContent({
  currentProfile,
}: {
  currentProfile: ArtistProfile;
}) {
  const { updateCurrentProfile } = useSocialStore();

  const [name, setName] = useState(currentProfile.name);
  const [handle, setHandle] = useState(currentProfile.handle);
  const [city, setCity] = useState(currentProfile.city);
  const [stateUf, setStateUf] = useState(currentProfile.state);
  const [territoryScope, setTerritoryScope] = useState<TerritoryScope>(
    currentProfile.territoryScope
  );
  const [bio, setBio] = useState(currentProfile.bio);
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatarUrl);
  const [coreLanguages, setCoreLanguages] = useState<string[]>(
    currentProfile.coreLanguages
  );
  const [supportLanguages, setSupportLanguages] = useState<string[]>(
    currentProfile.supportLanguages
  );
  const [experienceYears, setExperienceYears] = useState<number>(
    currentProfile.experienceYears
  );
  const [profileLevel, setProfileLevel] = useState<ProfileLevel>(
    currentProfile.profileLevel
  );
  const [hasCnpjOrMei, setHasCnpjOrMei] = useState<boolean>(
    currentProfile.hasCnpjOrMei
  );
  const [hasTechnicalFormation, setHasTechnicalFormation] = useState<boolean>(
    currentProfile.hasTechnicalFormation
  );

  const [customTag, setCustomTag] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const toggleCoreLanguage = (tag: string) => {
    setSupportLanguages((prev) => prev.filter((t) => t !== tag));
    setCoreLanguages((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleSupportLanguage = (tag: string) => {
    setCoreLanguages((prev) => prev.filter((t) => t !== tag));
    setSupportLanguages((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = customTag.trim();
    if (!trimmed) return;
    if (!coreLanguages.includes(trimmed) && !supportLanguages.includes(trimmed)) {
      setCoreLanguages((prev) => [...prev, trimmed]);
    }
    setCustomTag("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const mergedTags = Array.from(
      new Set([...coreLanguages, ...supportLanguages])
    );

    await updateCurrentProfile({
      name: name.trim() || currentProfile.name,
      handle: handle.trim().startsWith("@")
        ? handle.trim()
        : `@${handle.trim() || "artista"}`,
      city: city.trim(),
      state: stateUf.trim(),
      territoryScope,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || currentProfile.avatarUrl,
      coreLanguages,
      supportLanguages,
      tags: mergedTags,
      experienceYears: Math.max(0, Number(experienceYears) || 0),
      profileLevel,
      hasCnpjOrMei,
      hasTechnicalFormation,
    });

    setSavingProfile(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  const allAvailableTags = Array.from(
    new Set([...ALL_ART_TAGS, ...coreLanguages, ...supportLanguages])
  );

  return (
    <div className="divide-y divide-(--border-subtle)">
        {/* Form principal de perfil + parâmetros ArtistRank */}
        <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-5">
          {savedNotice && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-(--primary-soft) border border-(--primary-fg)/30 text-sm text-(--primary-ink) font-medium">
              <span className="inline-flex items-center gap-2">
                <Check size={16} />
                Perfil salvo no banco e recomendações recalculadas.
              </span>
              <Link href="/" className="font-bold underline">
                Ver feed
              </Link>
            </div>
          )}

          {/* Foto do perfil */}
          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-(--foreground)">
              Foto do perfil
            </label>
            <div className="flex flex-wrap items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt="Prévia do avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-(--primary-fg)"
              />
              <div className="flex items-center gap-2">
                {PRESET_AVATARS.map((preset, i) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`rounded-full p-0.5 border-2 cursor-pointer transition-colors ${
                      avatarUrl === preset
                        ? "border-(--accent)"
                        : "border-transparent hover:border-(--border-subtle)"
                    }`}
                    title={`Selecionar foto ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preset}
                      alt={`Opção ${i + 1}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="cfg-name" className="block text-sm font-bold text-(--foreground)">
                Nome
              </label>
              <input
                id="cfg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-handle" className="block text-sm font-bold text-(--foreground)">
                Usuário (@)
              </label>
              <input
                id="cfg-handle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              />
            </div>
          </div>

          {/* Localização e atuação territorial */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <label htmlFor="cfg-city" className="block text-sm font-bold text-(--foreground)">
                Cidade
              </label>
              <input
                id="cfg-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Salvador"
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-state" className="block text-sm font-bold text-(--foreground)">
                Estado (UF)
              </label>
              <select
                id="cfg-state"
                value={stateUf}
                onChange={(e) => setStateUf(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              >
                <option value="">Selecione</option>
                {BRAZILIAN_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-scope" className="block text-sm font-bold text-(--foreground)">
                Alcance de atuação
              </label>
              <select
                id="cfg-scope"
                value={territoryScope}
                onChange={(e) =>
                  setTerritoryScope(e.target.value as TerritoryScope)
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              >
                <option value="MUNICIPAL">Municipal</option>
                <option value="METROPOLITANO">Metropolitano</option>
                <option value="ESTADUAL">Estadual</option>
                <option value="NACIONAL">Nacional</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cfg-bio" className="block text-sm font-bold text-(--foreground)">
              Sobre você
            </label>
            <textarea
              id="cfg-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
            />
          </div>

          {/* Trajetória e Elegibilidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="cfg-level" className="block text-sm font-bold text-(--foreground)">
                Momento de carreira
              </label>
              <select
                id="cfg-level"
                value={profileLevel}
                onChange={(e) =>
                  setProfileLevel(e.target.value as ProfileLevel)
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              >
                <option value="INICIANTE">Iniciante</option>
                <option value="EMERGENTE">Emergente</option>
                <option value="CONSOLIDADO">Consolidado</option>
                <option value="MESTRE">Mestre</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cfg-exp" className="block text-sm font-bold text-(--foreground)">
                Anos de atuação artística
              </label>
              <input
                id="cfg-exp"
                type="number"
                min={0}
                max={70}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) tabular-nums focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-5 pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-(--foreground) cursor-pointer">
              <input
                type="checkbox"
                checked={hasCnpjOrMei}
                onChange={(e) => setHasCnpjOrMei(e.target.checked)}
                className="w-4 h-4 accent-(--primary-fg) rounded"
              />
              <span>Possuo CNPJ ou MEI cultural ativo</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-(--foreground) cursor-pointer">
              <input
                type="checkbox"
                checked={hasTechnicalFormation}
                onChange={(e) => setHasTechnicalFormation(e.target.checked)}
                className="w-4 h-4 accent-(--primary-fg) rounded"
              />
              <span>Possuo formação técnica comprovada</span>
            </label>
          </div>

          {/* Linguagens núcleo (peso 1.0) vs suporte (peso 0.65) */}
          <div className="space-y-3 pt-2 border-t border-(--border-subtle)">
            <div>
              <label className="block text-sm font-bold text-(--foreground)">
                Linguagens principais (peso 1,0 no ranqueamento)
              </label>
              <p className="text-xs text-(--text-subtle) mb-2">
                Áreas centrais do seu portfólio.
              </p>
              <div className="flex flex-wrap gap-2">
                {allAvailableTags.map((tag) => {
                  const selected = coreLanguages.includes(tag);
                  return (
                    <button
                      key={`core-${tag}`}
                      type="button"
                      onClick={() => toggleCoreLanguage(tag)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        selected
                          ? "bg-(--primary) border-(--primary-fg) text-white"
                          : "bg-(--bg-card) border-(--border-subtle) text-(--text-muted) hover:border-(--primary-fg)"
                      }`}
                    >
                      <span>{tag}</span>
                      {selected && <X size={13} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-(--foreground)">
                Linguagens de suporte (peso 0,65)
              </label>
              <p className="text-xs text-(--text-subtle) mb-2">
                Áreas complementares em que você também participa.
              </p>
              <div className="flex flex-wrap gap-2">
                {allAvailableTags.map((tag) => {
                  const selected = supportLanguages.includes(tag);
                  return (
                    <button
                      key={`sup-${tag}`}
                      type="button"
                      onClick={() => toggleSupportLanguage(tag)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        selected
                          ? "bg-(--accent) border-(--accent) text-(--on-accent)"
                          : "bg-(--bg-card) border-(--border-subtle) text-(--text-muted) hover:border-(--accent)"
                      }`}
                    >
                      <span>{tag}</span>
                      {selected && <X size={13} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Adicionar outra linguagem (ex: Circo, Grafite)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-4 py-2 rounded-xl bg-(--accent) text-(--on-accent) text-sm font-bold hover:bg-(--accent-hover) transition-colors cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-(--primary) text-white text-sm font-bold hover:bg-(--primary-hover) disabled:opacity-60 transition-colors cursor-pointer"
          >
            {savingProfile ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>

        <WorkManager profile={currentProfile} availableCategories={allAvailableTags} />

        <BadgeManager profile={currentProfile} availableCategories={allAvailableTags} />
      </div>
  );
}
