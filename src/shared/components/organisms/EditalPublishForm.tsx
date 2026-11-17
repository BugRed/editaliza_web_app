"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, FilePlus2, Sparkles } from "lucide-react";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import { ALL_ART_TAGS, BRAZILIAN_STATES } from "@/app/lib/user-profiles";
import { ProfileLevel, TerritoryScope } from "@/shared/lib/artistrank";
import {
  ALL_PROFILE_LEVELS,
  buildEditalPayload,
  checkEditalDraft,
  type EditalDraft,
} from "@/shared/lib/edital-draft";
import { TextInput, SelectInput, TextAreaInput } from "@/shared/components/atoms/FormControls";
import CheckboxField from "@/shared/components/molecules/CheckboxField";
import FormField from "@/shared/components/molecules/FormField";
import LanguageChips from "@/shared/components/molecules/LanguageChips";

const COVER_OPTIONS = [
  { label: "Pintura e Artes Visuais", url: "/images/edital_pintura_1794791580477.jpg" },
  { label: "Música e Show ao Vivo", url: "/images/edital_musica_1794791580539.jpg" },
  { label: "Ocupação e Espaço Cultural", url: "/images/edital_ocupacao_1794791581648.jpg" },
  { label: "Teatro e Palco", url: "/images/art_teatro_palco_1794791582532.jpg" },
];

const LEVEL_OPTIONS: { value: ProfileLevel; label: string }[] = [
  { value: "INICIANTE", label: "Iniciante" },
  { value: "EMERGENTE", label: "Emergente" },
  { value: "CONSOLIDADO", label: "Consolidado" },
  { value: "MESTRE", label: "Mestre" },
];

function toggleIn<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function initialDraft(city: string, stateUf: string): EditalDraft {
  return {
    title: "",
    description: "",
    whatIsIt: "",
    whoCanApplyText:
      "Artistas e grupos culturais atuantes nas linguagens indicadas.\nPortfólio atualizado com trabalhos recentes.",
    benefitsText:
      "Apoio financeiro para produção e execução do projeto.\nDivulgação oficial na programação cultural.",
    territoryScope: "NACIONAL",
    city,
    stateUf,
    requiredLanguages: ["Pintura"],
    acceptedLanguages: ["Pintura", "Artes Visuais"],
    requiresPortfolio: true,
    requiresCnpj: false,
    requiresTechnicalFormation: false,
    minExperienceYears: 1,
    targetProfileLevels: ALL_PROFILE_LEVELS,
    endDate: "2026-12-30",
    inscriptionLink: "https://link.com/inscricao",
    imgCoverUrl: COVER_OPTIONS[0].url,
  };
}

export default function EditalPublishForm() {
  const router = useRouter();
  const { publishEdital, currentProposer } = useSocialStore();
  const [draft, setDraft] = useState<EditalDraft>(() =>
    initialDraft(currentProposer?.city || "", currentProposer?.state || "")
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdTitle, setCreatedTitle] = useState("");

  const patch = (changes: Partial<EditalDraft>) => setDraft((prev) => ({ ...prev, ...changes }));

  // Toda linguagem obrigatória também é aceita; o inverso não vale.
  const toggleRequired = (tag: string) =>
    patch({
      requiredLanguages: toggleIn(draft.requiredLanguages, tag),
      acceptedLanguages: draft.acceptedLanguages.includes(tag)
        ? draft.acceptedLanguages
        : [...draft.acceptedLanguages, tag],
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreatedTitle("");

    const problem = checkEditalDraft(draft);
    if (problem) {
      setError(problem);
      return;
    }

    setSubmitting(true);
    const result = await publishEdital(buildEditalPayload(draft));
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || "Não foi possível publicar o edital.");
      return;
    }
    setCreatedTitle(draft.title.trim());
    patch({ title: "", description: "", whatIsIt: "" });
  };

  return (
    <div className="p-5 sm:p-6 space-y-6">
      <div className="rounded-xl border border-(--primary-border) bg-(--primary-soft) p-4 flex items-start gap-3">
        <FilePlus2 size={20} className="text-(--primary-fg) mt-0.5 shrink-0" />
        <div className="text-xs sm:text-sm text-(--primary-ink) space-y-1">
          <p className="font-bold">Novo edital no banco de oportunidades</p>
          <p>
            Os critérios abaixo alimentam diretamente o ranqueamento <strong>ArtistRank</strong> e o resumo sem
            academiquês exibido para os artistas.
          </p>
        </div>
      </div>

      {createdTitle && (
        <div
          role="status"
          className="rounded-xl border border-(--primary-fg)/30 bg-(--primary-soft) p-4 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-(--primary-ink)">
            <Check size={18} />
            <span>Edital &ldquo;{createdTitle}&rdquo; publicado com sucesso!</span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-4 py-1.5 rounded-lg bg-(--primary) text-white text-xs font-bold hover:bg-(--primary-hover) cursor-pointer"
          >
            Ver no Início
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-(--danger-border) bg-(--danger-soft) px-4 py-3 text-sm text-(--danger)"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField id="ed-title" label="Título do edital">
          <TextInput
            id="ed-title"
            type="text"
            required
            placeholder="Ex: Chamada Aberta de Artes Visuais 2026"
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
        </FormField>

        <FormField id="ed-desc" label="Descrição para o feed">
          <TextAreaInput
            id="ed-desc"
            rows={3}
            required
            placeholder="Apresente o objetivo do edital, bolsas ou cachês e formato da seleção..."
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </FormField>

        <div className="rounded-xl border border-(--border-subtle) bg-(--background) p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-(--primary-fg)">
            <Sparkles size={16} />
            <span>Resumo direto (sem academiquês) para o modal</span>
          </div>
          <FormField id="ed-what" label="O que é este edital na prática?">
            <TextAreaInput
              id="ed-what"
              rows={2}
              placeholder="Explique de forma simples o que o artista vai fazer e ganhar..."
              value={draft.whatIsIt}
              onChange={(e) => patch({ whatIsIt: e.target.value })}
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField id="ed-who" label="Quem pode participar (1 item por linha)">
              <TextAreaInput
                id="ed-who"
                rows={3}
                value={draft.whoCanApplyText}
                onChange={(e) => patch({ whoCanApplyText: e.target.value })}
              />
            </FormField>
            <FormField id="ed-ben" label="O que você recebe (1 item por linha)">
              <TextAreaInput
                id="ed-ben"
                rows={3}
                value={draft.benefitsText}
                onChange={(e) => patch({ benefitsText: e.target.value })}
              />
            </FormField>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField id="ed-scope" label="Abrangência">
            <SelectInput
              id="ed-scope"
              value={draft.territoryScope}
              onChange={(e) => patch({ territoryScope: e.target.value as TerritoryScope })}
            >
              <option value="NACIONAL">Nacional</option>
              <option value="ESTADUAL">Estadual</option>
              <option value="METROPOLITANO">Metropolitano</option>
              <option value="MUNICIPAL">Municipal</option>
            </SelectInput>
          </FormField>
          <FormField id="ed-city" label="Cidade (se regional)">
            <TextInput
              id="ed-city"
              type="text"
              placeholder="Ex: Recife"
              value={draft.city}
              onChange={(e) => patch({ city: e.target.value })}
            />
          </FormField>
          <FormField id="ed-state" label="Estado (UF)">
            <SelectInput id="ed-state" value={draft.stateUf} onChange={(e) => patch({ stateUf: e.target.value })}>
              <option value="">Todos</option>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <div className="space-y-3 pt-1">
          <LanguageChips
            title="Linguagens obrigatórias"
            hint="O artista precisa atuar em pelo menos uma destas áreas para não receber bloqueio."
            tags={ALL_ART_TAGS}
            selected={draft.requiredLanguages}
            variant="core"
            onToggle={toggleRequired}
          />
          <LanguageChips
            title="Todas as linguagens aceitas no edital"
            tags={ALL_ART_TAGS}
            selected={draft.acceptedLanguages}
            variant="support"
            onToggle={(tag) => patch({ acceptedLanguages: toggleIn(draft.acceptedLanguages, tag) })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField id="ed-exp" label="Experiência mínima (anos)">
            <TextInput
              id="ed-exp"
              type="number"
              min={0}
              max={30}
              className="tabular-nums"
              value={draft.minExperienceYears}
              onChange={(e) => patch({ minExperienceYears: Number(e.target.value) })}
            />
          </FormField>
          <FormField id="ed-end" label="Prazo final de inscrição">
            <TextInput
              id="ed-end"
              type="date"
              className="tabular-nums"
              value={draft.endDate}
              onChange={(e) => patch({ endDate: e.target.value })}
            />
          </FormField>
          <FormField id="ed-cover" label="Capa do edital">
            <SelectInput id="ed-cover" value={draft.imgCoverUrl} onChange={(e) => patch({ imgCoverUrl: e.target.value })}>
              {COVER_OPTIONS.map((opt) => (
                <option key={opt.url} value={opt.url}>
                  {opt.label}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold text-(--foreground)">Momentos de carreira contemplados</p>
          <div className="flex flex-wrap gap-2">
            {LEVEL_OPTIONS.map((level) => {
              const active = draft.targetProfileLevels.includes(level.value);
              return (
                <button
                  key={level.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => patch({ targetProfileLevels: toggleIn(draft.targetProfileLevels, level.value) })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    active
                      ? "bg-(--primary-soft) border-(--primary-fg) text-(--primary-fg)"
                      : "bg-(--bg-card) border-(--border-subtle) text-(--text-muted)"
                  }`}
                >
                  {level.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-5 pt-1">
          <CheckboxField
            label="Exige portfólio"
            checked={draft.requiresPortfolio}
            onChange={(requiresPortfolio) => patch({ requiresPortfolio })}
          />
          <CheckboxField
            label="Exige CNPJ ou MEI"
            checked={draft.requiresCnpj}
            onChange={(requiresCnpj) => patch({ requiresCnpj })}
          />
          <CheckboxField
            label="Exige formação técnica"
            checked={draft.requiresTechnicalFormation}
            onChange={(requiresTechnicalFormation) => patch({ requiresTechnicalFormation })}
          />
        </div>

        <FormField id="ed-link" label="Link oficial de inscrição">
          <TextInput
            id="ed-link"
            type="url"
            value={draft.inscriptionLink}
            onChange={(e) => patch({ inscriptionLink: e.target.value })}
          />
        </FormField>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-(--primary) text-white text-sm font-bold hover:bg-(--primary-hover) disabled:opacity-60 transition-colors cursor-pointer"
          >
            {submitting ? "Publicando edital..." : "Publicar edital"}
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl border border-(--border-subtle) text-sm font-semibold text-(--text-muted) hover:bg-(--surface-subtle)"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
