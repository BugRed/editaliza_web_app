"use client";

import { useState } from "react";
import BadgeManager from "@/shared/components/organisms/BadgeManager";
import WorkManager from "@/shared/components/organisms/WorkManager";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import { ALL_ART_TAGS, ArtistProfile, BRAZILIAN_STATES } from "@/app/lib/user-profiles";
import { ProfileLevel, TerritoryScope } from "@/shared/lib/artistrank";
import { TextInput, SelectInput, TextAreaInput } from "@/shared/components/atoms/FormControls";
import SubmitButton from "@/shared/components/atoms/SubmitButton";
import FormField from "@/shared/components/molecules/FormField";
import SavedNotice from "@/shared/components/molecules/SavedNotice";
import LanguageChips from "@/shared/components/molecules/LanguageChips";
import PresetAvatarPicker from "@/shared/components/molecules/PresetAvatarPicker";

const SAVED_NOTICE_MS = 3500;

const PRESET_AVATARS = [
  "/images/avatar_joao_1794791579584.jpg",
  "/images/avatar_maria_1794791579527.jpg",
  "/images/avatar_carlos_1794791579626.jpg",
];

function toggleIn(list: string[], tag: string): string[] {
  return list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag];
}

export default function ArtistSettingsForm({ currentProfile }: { currentProfile: ArtistProfile }) {
  const { updateCurrentProfile } = useSocialStore();

  const [name, setName] = useState(currentProfile.name);
  const [handle, setHandle] = useState(currentProfile.handle);
  const [city, setCity] = useState(currentProfile.city);
  const [stateUf, setStateUf] = useState(currentProfile.state);
  const [territoryScope, setTerritoryScope] = useState<TerritoryScope>(currentProfile.territoryScope);
  const [bio, setBio] = useState(currentProfile.bio);
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatarUrl);
  const [coreLanguages, setCoreLanguages] = useState<string[]>(currentProfile.coreLanguages);
  const [supportLanguages, setSupportLanguages] = useState<string[]>(currentProfile.supportLanguages);
  const [experienceYears, setExperienceYears] = useState<number>(currentProfile.experienceYears);
  const [profileLevel, setProfileLevel] = useState<ProfileLevel>(currentProfile.profileLevel);
  const [hasCnpjOrMei, setHasCnpjOrMei] = useState<boolean>(currentProfile.hasCnpjOrMei);
  const [hasTechnicalFormation, setHasTechnicalFormation] = useState<boolean>(
    currentProfile.hasTechnicalFormation
  );

  const [customTag, setCustomTag] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Uma linguagem é núcleo ou suporte, nunca as duas: marcar numa lista desmarca da outra.
  const toggleCoreLanguage = (tag: string) => {
    setSupportLanguages((prev) => prev.filter((t) => t !== tag));
    setCoreLanguages((prev) => toggleIn(prev, tag));
  };

  const toggleSupportLanguage = (tag: string) => {
    setCoreLanguages((prev) => prev.filter((t) => t !== tag));
    setSupportLanguages((prev) => toggleIn(prev, tag));
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
    await updateCurrentProfile({
      name: name.trim() || currentProfile.name,
      handle: handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim() || "artista"}`,
      city: city.trim(),
      state: stateUf.trim(),
      territoryScope,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || currentProfile.avatarUrl,
      coreLanguages,
      supportLanguages,
      tags: Array.from(new Set([...coreLanguages, ...supportLanguages])),
      experienceYears: Math.max(0, Number(experienceYears) || 0),
      profileLevel,
      hasCnpjOrMei,
      hasTechnicalFormation,
    });
    setSavingProfile(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), SAVED_NOTICE_MS);
  };

  const allAvailableTags = Array.from(
    new Set([...ALL_ART_TAGS, ...coreLanguages, ...supportLanguages])
  );

  return (
    <div className="divide-y divide-(--border-subtle)">
      <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-5">
        {savedNotice && (
          <SavedNotice
            message="Perfil salvo no banco e recomendações recalculadas."
            href="/"
            linkLabel="Ver feed"
          />
        )}

        <PresetAvatarPicker value={avatarUrl} presets={PRESET_AVATARS} onChange={setAvatarUrl} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="cfg-name" label="Nome">
            <TextInput id="cfg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField id="cfg-handle" label="Usuário (@)">
            <TextInput id="cfg-handle" type="text" value={handle} onChange={(e) => setHandle(e.target.value)} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField id="cfg-city" label="Cidade" className="sm:col-span-1">
            <TextInput
              id="cfg-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Salvador"
            />
          </FormField>
          <FormField id="cfg-state" label="Estado (UF)">
            <SelectInput id="cfg-state" value={stateUf} onChange={(e) => setStateUf(e.target.value)}>
              <option value="">Selecione</option>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField id="cfg-scope" label="Alcance de atuação">
            <SelectInput
              id="cfg-scope"
              value={territoryScope}
              onChange={(e) => setTerritoryScope(e.target.value as TerritoryScope)}
            >
              <option value="MUNICIPAL">Municipal</option>
              <option value="METROPOLITANO">Metropolitano</option>
              <option value="ESTADUAL">Estadual</option>
              <option value="NACIONAL">Nacional</option>
            </SelectInput>
          </FormField>
        </div>

        <FormField id="cfg-bio" label="Sobre você">
          <TextAreaInput id="cfg-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="cfg-level" label="Momento de carreira">
            <SelectInput
              id="cfg-level"
              value={profileLevel}
              onChange={(e) => setProfileLevel(e.target.value as ProfileLevel)}
            >
              <option value="INICIANTE">Iniciante</option>
              <option value="EMERGENTE">Emergente</option>
              <option value="CONSOLIDADO">Consolidado</option>
              <option value="MESTRE">Mestre</option>
            </SelectInput>
          </FormField>
          <FormField id="cfg-exp" label="Anos de atuação artística">
            <TextInput
              id="cfg-exp"
              type="number"
              min={0}
              max={70}
              className="tabular-nums"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
            />
          </FormField>
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

        <div className="space-y-3 pt-2 border-t border-(--border-subtle)">
          <LanguageChips
            title="Linguagens principais (peso 1,0 no ranqueamento)"
            hint="Áreas centrais do seu portfólio."
            tags={allAvailableTags}
            selected={coreLanguages}
            variant="core"
            onToggle={toggleCoreLanguage}
          />
          <LanguageChips
            title="Linguagens de suporte (peso 0,65)"
            hint="Áreas complementares em que você também participa."
            tags={allAvailableTags}
            selected={supportLanguages}
            variant="support"
            onToggle={toggleSupportLanguage}
          />
          <div className="flex gap-2 pt-1">
            <TextInput
              type="text"
              aria-label="Outra linguagem"
              className="flex-1 py-2"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Adicionar outra linguagem (ex: Circo, Grafite)"
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

        <SubmitButton saving={savingProfile} className="w-full sm:w-auto" />
      </form>

      <WorkManager profile={currentProfile} availableCategories={allAvailableTags} />
      <BadgeManager profile={currentProfile} availableCategories={allAvailableTags} />
    </div>
  );
}
