"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, FilePlus2, Sparkles } from "lucide-react";
import AppShell from "@/shared/components/organisms/AppShell";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import { ALL_ART_TAGS, BRAZILIAN_STATES } from "@/app/lib/user-profiles";
import { ProfileLevel, TerritoryScope } from "@/shared/lib/artistrank";

const COVER_OPTIONS = [
  {
    label: "Pintura e Artes Visuais",
    url: "/images/edital_pintura_1794791580477.jpg",
  },
  {
    label: "Música e Show ao Vivo",
    url: "/images/edital_musica_1794791580539.jpg",
  },
  {
    label: "Ocupação e Espaço Cultural",
    url: "/images/edital_ocupacao_1794791581648.jpg",
  },
  {
    label: "Teatro e Palco",
    url: "/images/art_teatro_palco_1794791582532.jpg",
  },
];

const LEVEL_OPTIONS: { value: ProfileLevel; label: string }[] = [
  { value: "INICIANTE", label: "Iniciante" },
  { value: "EMERGENTE", label: "Emergente" },
  { value: "CONSOLIDADO", label: "Consolidado" },
  { value: "MESTRE", label: "Mestre" },
];

export default function PublicarEditalPage() {
  const router = useRouter();
  const { publishEdital, currentProposer } = useSocialStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [whatIsIt, setWhatIsIt] = useState("");
  const [whoCanApplyText, setWhoCanApplyText] = useState(
    "Artistas e grupos culturais atuantes nas linguagens indicadas.\nPortfólio atualizado com trabalhos recentes."
  );
  const [benefitsText, setBenefitsText] = useState(
    "Apoio financeiro para produção e execução do projeto.\nDivulgação oficial na programação cultural."
  );

  const [territoryScope, setTerritoryScope] =
    useState<TerritoryScope>("NACIONAL");
  const [city, setCity] = useState(currentProposer?.city || "");
  const [stateUf, setStateUf] = useState(currentProposer?.state || "");
  const [requiredLanguages, setRequiredLanguages] = useState<string[]>([
    "Pintura",
  ]);
  const [acceptedLanguages, setAcceptedLanguages] = useState<string[]>([
    "Pintura",
    "Artes Visuais",
  ]);
  const [requiresPortfolio, setRequiresPortfolio] = useState(true);
  const [requiresCnpj, setRequiresCnpj] = useState(false);
  const [requiresTechnicalFormation, setRequiresTechnicalFormation] =
    useState(false);
  const [minExperienceYears, setMinExperienceYears] = useState(1);
  const [targetProfileLevels, setTargetProfileLevels] = useState<
    ProfileLevel[]
  >(["INICIANTE", "EMERGENTE", "CONSOLIDADO"]);
  const [endDate, setEndDate] = useState("2026-12-30");
  const [inscriptionLink, setInscriptionLink] = useState(
    "https://link.com/inscricao"
  );
  const [imgCoverUrl, setImgCoverUrl] = useState(COVER_OPTIONS[0].url);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdTitle, setCreatedTitle] = useState("");

  const toggleRequired = (tag: string) => {
    setRequiredLanguages((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    if (!acceptedLanguages.includes(tag)) {
      setAcceptedLanguages((prev) => [...prev, tag]);
    }
  };

  const toggleAccepted = (tag: string) => {
    setAcceptedLanguages((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleLevel = (lvl: ProfileLevel) => {
    setTargetProfileLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreatedTitle("");

    if (title.trim().length < 3) {
      setError("Informe o título do edital.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Escreva uma descrição de pelo menos 10 caracteres.");
      return;
    }
    if (acceptedLanguages.length === 0 && requiredLanguages.length === 0) {
      setError("Selecione pelo menos uma linguagem artística para o edital.");
      return;
    }

    setSubmitting(true);
    const whoCanApply = whoCanApplyText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const benefits = benefitsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const extraTags = Array.from(
      new Set([...requiredLanguages, ...acceptedLanguages])
    );

    const result = await publishEdital({
      title: title.trim(),
      description: description.trim(),
      endDate: endDate ? new Date(`${endDate}T23:59:59Z`).toISOString() : null,
      inscriptionLink: inscriptionLink.trim() || "https://link.com/inscricao",
      completeEditalLink:
        inscriptionLink.trim() || "https://link.com/edital.pdf",
      imgCoverUrl,
      territoryScope,
      city: city.trim() || null,
      state: stateUf.trim() || null,
      requiredLanguages,
      acceptedLanguages:
        acceptedLanguages.length > 0 ? acceptedLanguages : requiredLanguages,
      requiresPortfolio,
      requiresCnpj,
      requiresTechnicalFormation,
      minExperienceYears: Math.max(0, Number(minExperienceYears) || 0),
      targetProfileLevels:
        targetProfileLevels.length > 0
          ? targetProfileLevels
          : ["INICIANTE", "EMERGENTE", "CONSOLIDADO"],
      plainSummary: {
        whatIsIt: whatIsIt.trim() || description.trim(),
        whoCanApply,
        benefits,
        extraTags,
      },
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error || "Não foi possível publicar o edital.");
      return;
    }

    setCreatedTitle(title.trim());
    setTitle("");
    setDescription("");
    setWhatIsIt("");
  };

  return (
    <AppShell title="Publicar edital">
      <div className="p-5 sm:p-6 space-y-6">
        <div className="rounded-xl border border-(--primary-border) bg-(--primary-soft) p-4 flex items-start gap-3">
          <FilePlus2 size={20} className="text-(--primary-fg) mt-0.5 shrink-0" />
          <div className="text-xs sm:text-sm text-(--primary-ink) space-y-1">
            <p className="font-bold">Novo edital no banco de oportunidades</p>
            <p>
              Os critérios abaixo alimentam diretamente o ranqueamento{" "}
              <strong>ArtistRank</strong> e o resumo sem academiquês exibido para os artistas.
            </p>
          </div>
        </div>

        {createdTitle && (
          <div className="rounded-xl border border-(--primary-fg)/30 bg-(--primary-soft) p-4 flex flex-wrap items-center justify-between gap-3">
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
          <div className="space-y-1.5">
            <label htmlFor="ed-title" className="block text-sm font-bold text-(--foreground)">
              Título do edital
            </label>
            <input
              id="ed-title"
              type="text"
              placeholder="Ex: Chamada Aberta de Artes Visuais 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ed-desc" className="block text-sm font-bold text-(--foreground)">
              Descrição para o feed
            </label>
            <textarea
              id="ed-desc"
              rows={3}
              placeholder="Apresente o objetivo do edital, bolsas ou cachês e formato da seleção..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              required
            />
          </div>

          {/* Resumo sem academiquês */}
          <div className="rounded-xl border border-(--border-subtle) bg-(--background) p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-(--primary-fg)">
              <Sparkles size={16} />
              <span>Resumo direto (sem academiquês) para o modal</span>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ed-what" className="block text-xs font-bold text-(--foreground)">
                O que é este edital na prática?
              </label>
              <textarea
                id="ed-what"
                rows={2}
                placeholder="Explique de forma simples o que o artista vai fazer e ganhar..."
                value={whatIsIt}
                onChange={(e) => setWhatIsIt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-(--bg-card) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="ed-who" className="block text-xs font-bold text-(--foreground)">
                  Quem pode participar (1 item por linha)
                </label>
                <textarea
                  id="ed-who"
                  rows={3}
                  value={whoCanApplyText}
                  onChange={(e) => setWhoCanApplyText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-(--bg-card) border border-(--border-subtle) text-xs sm:text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ed-ben" className="block text-xs font-bold text-(--foreground)">
                  O que você recebe (1 item por linha)
                </label>
                <textarea
                  id="ed-ben"
                  rows={3}
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-(--bg-card) border border-(--border-subtle) text-xs sm:text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                />
              </div>
            </div>
          </div>

          {/* Abrangência territorial */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="ed-scope" className="block text-sm font-bold text-(--foreground)">
                Abrangência
              </label>
              <select
                id="ed-scope"
                value={territoryScope}
                onChange={(e) =>
                  setTerritoryScope(e.target.value as TerritoryScope)
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              >
                <option value="NACIONAL">Nacional</option>
                <option value="ESTADUAL">Estadual</option>
                <option value="METROPOLITANO">Metropolitano</option>
                <option value="MUNICIPAL">Municipal</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ed-city" className="block text-sm font-bold text-(--foreground)">
                Cidade (se regional)
              </label>
              <input
                id="ed-city"
                type="text"
                placeholder="Ex: Recife"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ed-state" className="block text-sm font-bold text-(--foreground)">
                Estado (UF)
              </label>
              <select
                id="ed-state"
                value={stateUf}
                onChange={(e) => setStateUf(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              >
                <option value="">Todos</option>
                {BRAZILIAN_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linguagens */}
          <div className="space-y-3 pt-1">
            <div>
              <p className="text-sm font-bold text-(--foreground)">
                Linguagens obrigatórias
              </p>
              <p className="text-xs text-(--text-subtle) mb-2">
                O artista precisa atuar em pelo menos uma destas áreas para não receber bloqueio.
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_ART_TAGS.map((tag) => {
                  const selected = requiredLanguages.includes(tag);
                  return (
                    <button
                      key={`req-${tag}`}
                      type="button"
                      onClick={() => toggleRequired(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        selected
                          ? "bg-(--primary) border-(--primary-fg) text-white"
                          : "bg-(--bg-card) border-(--border-subtle) text-(--text-muted) hover:border-(--primary-fg)"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-(--foreground)">
                Todas as linguagens aceitas no edital
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {ALL_ART_TAGS.map((tag) => {
                  const selected = acceptedLanguages.includes(tag);
                  return (
                    <button
                      key={`acc-${tag}`}
                      type="button"
                      onClick={() => toggleAccepted(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        selected
                          ? "bg-(--accent) border-(--accent) text-(--on-accent)"
                          : "bg-(--bg-card) border-(--border-subtle) text-(--text-muted) hover:border-(--accent)"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Elegibilidade & Prazos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="ed-exp" className="block text-sm font-bold text-(--foreground)">
                Experiência mínima (anos)
              </label>
              <input
                id="ed-exp"
                type="number"
                min={0}
                max={30}
                value={minExperienceYears}
                onChange={(e) => setMinExperienceYears(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) tabular-nums focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ed-end" className="block text-sm font-bold text-(--foreground)">
                Prazo final de inscrição
              </label>
              <input
                id="ed-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) tabular-nums focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ed-cover" className="block text-sm font-bold text-(--foreground)">
                Capa do edital
              </label>
              <select
                id="ed-cover"
                value={imgCoverUrl}
                onChange={(e) => setImgCoverUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              >
                {COVER_OPTIONS.map((opt) => (
                  <option key={opt.url} value={opt.url}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-(--foreground)">
              Momentos de carreira contemplados
            </p>
            <div className="flex flex-wrap gap-2">
              {LEVEL_OPTIONS.map((lvl) => {
                const active = targetProfileLevels.includes(lvl.value);
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => toggleLevel(lvl.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      active
                        ? "bg-(--primary-soft) border-(--primary-fg) text-(--primary-fg)"
                        : "bg-(--bg-card) border-(--border-subtle) text-(--text-muted)"
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-5 pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-(--foreground) cursor-pointer">
              <input
                type="checkbox"
                checked={requiresPortfolio}
                onChange={(e) => setRequiresPortfolio(e.target.checked)}
                className="w-4 h-4 accent-(--primary-fg) rounded"
              />
              <span>Exige portfólio</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-(--foreground) cursor-pointer">
              <input
                type="checkbox"
                checked={requiresCnpj}
                onChange={(e) => setRequiresCnpj(e.target.checked)}
                className="w-4 h-4 accent-(--primary-fg) rounded"
              />
              <span>Exige CNPJ ou MEI</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-(--foreground) cursor-pointer">
              <input
                type="checkbox"
                checked={requiresTechnicalFormation}
                onChange={(e) => setRequiresTechnicalFormation(e.target.checked)}
                className="w-4 h-4 accent-(--primary-fg) rounded"
              />
              <span>Exige formação técnica</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ed-link" className="block text-sm font-bold text-(--foreground)">
              Link oficial de inscrição
            </label>
            <input
              id="ed-link"
              type="url"
              value={inscriptionLink}
              onChange={(e) => setInscriptionLink(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
            />
          </div>

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
    </AppShell>
  );
}
