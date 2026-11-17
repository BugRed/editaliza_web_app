"use client";

import { LogoMark } from "@/app/components/brand/Logo";
import { useState } from "react";
import Link from "next/link";
import { Building2, Palette } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import AvatarPicker from "@/app/components/forms/AvatarPicker";
import PasswordChecklist from "@/app/components/forms/PasswordChecklist";
import { ALL_ART_TAGS, ART_LANGUAGE_GROUPS, BRAZILIAN_STATES } from "@/app/lib/user-profiles";
import { formatCnpj, formatCpf, isValidCpf, onlyDigits } from "@/shared/lib/documents";
import { isStrongPassword, PASSWORD_MIN_LENGTH, PASSWORD_POLICY_MESSAGE } from "@/shared/lib/password-policy";
import { ProfileLevel, TerritoryScope } from "@/shared/lib/artistrank";

export default function CadastroPage() {
  const { register } = useAuth();

  const [userType, setUserType] = useState<"ARTIST" | "PROPOSER">("ARTIST");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [bio, setBio] = useState("");

  // Artista
  const [cpf, setCpf] = useState("");
  const [territoryScope, setTerritoryScope] = useState<TerritoryScope>("ESTADUAL");
  const [profileLevel, setProfileLevel] = useState<ProfileLevel>("INICIANTE");
  const [experienceYears, setExperienceYears] = useState(1);
  const [coreLanguages, setCoreLanguages] = useState<string[]>(["Pintura"]);
  const [hasCnpjOrMei, setHasCnpjOrMei] = useState(false);
  const [hasTechnicalFormation, setHasTechnicalFormation] = useState(false);

  // Propositor
  const [cnpj, setCnpj] = useState("");

  const [erro, setErro] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [otherLanguage, setOtherLanguage] = useState("");

  const toggleLanguage = (tag: string) => {
    setCoreLanguages((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addOtherLanguage = () => {
    const language = otherLanguage.trim().slice(0, 40);
    if (!language) return;
    const exists = coreLanguages.some((item) => item.toLowerCase() === language.toLowerCase());
    if (!exists) setCoreLanguages((prev) => [...prev, language]);
    setOtherLanguage("");
  };

  const customLanguages = coreLanguages.filter((language) => !ALL_ART_TAGS.includes(language));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (name.trim().length < 2) {
      setErro(
        userType === "ARTIST"
          ? "Informe seu nome completo."
          : "Informe o nome da instituição ou organização propositora."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErro("Digite um e-mail válido.");
      return;
    }

    if (!isStrongPassword(password)) {
      setErro(PASSWORD_POLICY_MESSAGE);
      return;
    }

    if (userType === "ARTIST") {
      if (onlyDigits(cpf) && !isValidCpf(cpf)) {
        setErro("CPF inválido. Confira os números.");
        return;
      }
      if (coreLanguages.length === 0) {
        setErro("Selecione pelo menos uma linguagem artística principal.");
        return;
      }
    }

    if (userType === "PROPOSER") {
      const cnpjDigits = cnpj.replace(/\D/g, "");
      if (cnpjDigits.length !== 14) {
        setErro("Informe um CNPJ válido com 14 dígitos.");
        return;
      }
    }

    // Foto só é obrigatória para artista; a empresa pode cadastrar sem logo e mandar depois.
    if (userType === "ARTIST" && !avatarDataUrl) {
      setAvatarError("Escolha uma foto sua para continuar.");
      setErro("Falta a foto do perfil.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        userType,
        name: name.trim(),
        handle: handle.trim() || undefined,
        email: email.trim(),
        password,
        avatarDataUrl: avatarDataUrl || undefined,
        city: city.trim(),
        state: stateUf.trim(),
        bio: bio.trim(),
        cpf: userType === "ARTIST" ? cpf : undefined,
        territoryScope: userType === "ARTIST" ? territoryScope : undefined,
        profileLevel: userType === "ARTIST" ? profileLevel : undefined,
        experienceYears: userType === "ARTIST" ? experienceYears : undefined,
        coreLanguages: userType === "ARTIST" ? coreLanguages : undefined,
        hasCnpjOrMei: userType === "ARTIST" ? hasCnpjOrMei : undefined,
        hasTechnicalFormation:
          userType === "ARTIST" ? hasTechnicalFormation : undefined,
        cnpj: userType === "PROPOSER" ? cnpj : undefined,
      });

      if (!res.success) {
        setErro(res.message || "Não foi possível concluir o cadastro.");
      }
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-(--background) px-4 py-10">
      <div className="w-full max-w-xl bg-(--bg-card) border border-(--border-subtle) rounded-xl shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-(--primary) via-(--primary) to-(--accent)" />

        <div className="p-6 sm:p-8 flex flex-col">
          <div className="flex flex-col items-center text-center mb-6">
            <LogoMark size={56} className="mb-3" />
            <h1 className="text-2xl font-bold tracking-tight text-(--primary-fg)">
              Criar conta no Editaliza
            </h1>
            <p className="text-sm text-(--text-muted) mt-1">
              Escolha o tipo de perfil para acessar oportunidades ou divulgar editais.
            </p>
          </div>

          {/* Seletor de tipo de pessoa: Artista ou Propositor */}
          <div
            role="tablist"
            aria-label="Tipo de cadastro"
            className="grid grid-cols-2 gap-2.5 mb-6"
          >
            <button
              type="button"
              role="tab"
              aria-selected={userType === "ARTIST"}
              onClick={() => {
                setUserType("ARTIST");
                setErro("");
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-colors cursor-pointer ${
                userType === "ARTIST"
                  ? "bg-(--primary-soft) border-(--primary-fg) text-(--primary-fg)"
                  : "bg-(--background) border-(--border-subtle) text-(--text-muted) hover:border-(--primary-fg)"
              }`}
            >
              <Palette size={18} />
              <span>Sou Artista</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={userType === "PROPOSER"}
              onClick={() => {
                setUserType("PROPOSER");
                setErro("");
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-colors cursor-pointer ${
                userType === "PROPOSER"
                  ? "bg-(--accent-soft) border-(--accent) text-(--accent-ink)"
                  : "bg-(--background) border-(--border-subtle) text-(--text-muted) hover:border-(--accent)"
              }`}
            >
              <Building2 size={18} />
              <span>Sou Propositor</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">
            {erro && (
              <div
                role="alert"
                className="bg-(--danger-soft) border border-(--danger-border) text-(--danger) px-4 py-3 rounded-lg text-sm"
              >
                {erro}
              </div>
            )}

            <AvatarPicker
              label={userType === "ARTIST" ? "Sua foto de perfil" : "Logo da instituição"}
              required={userType === "ARTIST"}
              hint={userType === "ARTIST" ? "Aparece no seu perfil e nos posts. JPG, PNG ou WebP; recortamos em quadrado." : "Opcional: aparece no perfil da empresa e nos editais. Sem logo, usamos uma imagem padrão. Você pode enviar depois."}
              value={avatarDataUrl}
              onChange={(value) => {
                setAvatarDataUrl(value);
                setAvatarError("");
              }}
              error={avatarError}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cad-name" className="block text-sm font-medium text-(--foreground)">
                  {userType === "ARTIST" ? "Nome completo" : "Nome da instituição"}
                </label>
                <input
                  id="cad-name"
                  type="text"
                  placeholder={
                    userType === "ARTIST"
                      ? "Ex: Clara Mendes"
                      : "Ex: Instituto Cultural Sol"
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cad-handle" className="block text-sm font-medium text-(--foreground)">
                  Usuário (@)
                </label>
                <input
                  id="cad-handle"
                  type="text"
                  placeholder="@seu.usuario"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cad-email" className="block text-sm font-medium text-(--foreground)">
                  E-mail
                </label>
                <input
                  id="cad-email"
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cad-password" className="block text-sm font-medium text-(--foreground)">
                  Senha
                </label>
                <input
                  id="cad-password"
                  type="password"
                  name="password"
                  placeholder="Crie uma senha forte"
                  minLength={PASSWORD_MIN_LENGTH}
                  autoComplete="new-password"
                  aria-describedby="cad-password-rules"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg) focus:border-(--primary-fg) transition-colors"
                  required
                />
                <div id="cad-password-rules">
                  <PasswordChecklist password={password} />
                </div>
              </div>
            </div>

            {/* Documento específico por papel */}
            {userType === "ARTIST" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="cad-cpf" className="block text-sm font-medium text-(--foreground)">
                    CPF (opcional)
                  </label>
                  <input
                    id="cad-cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={14}
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cad-city" className="block text-sm font-medium text-(--foreground)">
                    Cidade
                  </label>
                  <input
                    id="cad-city"
                    type="text"
                    placeholder="Ex: Recife"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cad-uf" className="block text-sm font-medium text-(--foreground)">
                    Estado (UF)
                  </label>
                  <select
                    id="cad-uf"
                    value={stateUf}
                    onChange={(e) => setStateUf(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                  >
                    <option value="">UF</option>
                    {BRAZILIAN_STATES.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="cad-cnpj" className="block text-sm font-medium text-(--foreground)">
                    CNPJ da organização
                  </label>
                  <input
                    id="cad-cnpj"
                    type="text"
                    placeholder="00.000.000/0001-00"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={18}
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cad-p-city" className="block text-sm font-medium text-(--foreground)">
                    Cidade sede
                  </label>
                  <input
                    id="cad-p-city"
                    type="text"
                    placeholder="Ex: São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cad-p-uf" className="block text-sm font-medium text-(--foreground)">
                    Estado (UF)
                  </label>
                  <select
                    id="cad-p-uf"
                    value={stateUf}
                    onChange={(e) => setStateUf(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                  >
                    <option value="">UF</option>
                    {BRAZILIAN_STATES.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Campos de ArtistRank para Pessoa Artista */}
            {userType === "ARTIST" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="cad-scope" className="block text-sm font-medium text-(--foreground)">
                      Atuação
                    </label>
                    <select
                      id="cad-scope"
                      value={territoryScope}
                      onChange={(e) =>
                        setTerritoryScope(e.target.value as TerritoryScope)
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                    >
                      <option value="MUNICIPAL">Municipal</option>
                      <option value="METROPOLITANO">Metropolitano</option>
                      <option value="ESTADUAL">Estadual</option>
                      <option value="NACIONAL">Nacional</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="cad-level" className="block text-sm font-medium text-(--foreground)">
                      Momento
                    </label>
                    <select
                      id="cad-level"
                      value={profileLevel}
                      onChange={(e) =>
                        setProfileLevel(e.target.value as ProfileLevel)
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                    >
                      <option value="INICIANTE">Iniciante</option>
                      <option value="EMERGENTE">Emergente</option>
                      <option value="CONSOLIDADO">Consolidado</option>
                      <option value="MESTRE">Mestre</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="cad-exp" className="block text-sm font-medium text-(--foreground)">
                      Anos de prática
                    </label>
                    <input
                      id="cad-exp"
                      type="number"
                      min={0}
                      max={70}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) tabular-nums focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="block text-sm font-medium text-(--foreground)">Linguagens principais</span>
                    <p className="text-xs text-(--text-subtle)">
                      Escolha todas que fazem parte do seu trabalho. {coreLanguages.length}{" "}
                      {coreLanguages.length === 1 ? "selecionada" : "selecionadas"}.
                    </p>
                  </div>
                  {ART_LANGUAGE_GROUPS.map((group) => (
                    <fieldset key={group.group} className="space-y-1.5">
                      <legend className="text-[11px] font-bold uppercase tracking-wider text-(--text-subtle)">{group.group}</legend>
                      <div className="flex flex-wrap gap-2">
                        {group.languages.map((tag) => {
                          const active = coreLanguages.includes(tag);
                          return (
                          <button
                            key={tag}
                            type="button"
                            aria-pressed={active}
                            onClick={() => toggleLanguage(tag)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                              active
                                ? "bg-(--primary) border-(--primary-fg) text-white"
                                : "bg-(--bg-card) border-(--border-subtle) text-(--text-muted) hover:border-(--primary-fg)"
                            }`}
                          >
                            {tag}
                          </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                  {customLanguages.length > 0 && (
                    <fieldset className="space-y-1.5">
                      <legend className="text-[11px] font-bold uppercase tracking-wider text-(--text-subtle)">Suas linguagens</legend>
                      <div className="flex flex-wrap gap-2">
                        {customLanguages.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            aria-pressed="true"
                            aria-label={`Remover ${tag}`}
                            onClick={() => toggleLanguage(tag)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-(--primary) border-(--primary-fg) text-white cursor-pointer"
                          >
                            {tag} ×
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}
                  <div className="flex gap-2">
                    <label htmlFor="cad-other-language" className="sr-only">
                      Outra linguagem
                    </label>
                    <input
                      id="cad-other-language"
                      type="text"
                      maxLength={40}
                      placeholder="Não achou a sua? Digite outra (ex: Cordel)"
                      value={otherLanguage}
                      onChange={(e) => setOtherLanguage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addOtherLanguage();
                        }
                      }}
                      className="min-w-0 flex-1 px-3.5 py-2 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                    />
                    <button
                      type="button"
                      onClick={addOtherLanguage}
                      className="px-4 py-2 rounded-lg bg-(--accent) text-(--on-accent) text-sm font-bold hover:bg-(--accent-hover) cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-5 pt-1">
                  <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-(--foreground) cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCnpjOrMei}
                      onChange={(e) => setHasCnpjOrMei(e.target.checked)}
                      className="w-4 h-4 accent-(--primary-fg) rounded"
                    />
                    <span>Possuo CNPJ ou MEI cultural</span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-(--foreground) cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasTechnicalFormation}
                      onChange={(e) => setHasTechnicalFormation(e.target.checked)}
                      className="w-4 h-4 accent-(--primary-fg) rounded"
                    />
                    <span>Possuo formação técnica</span>
                  </label>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label htmlFor="cad-bio" className="block text-sm font-medium text-(--foreground)">
                {userType === "ARTIST"
                  ? "Sobre seu trabalho artístico"
                  : "Sobre a organização propositora"}
              </label>
              <textarea
                id="cad-bio"
                rows={2}
                placeholder={
                  userType === "ARTIST"
                    ? "Conte brevemente o que você cria e pesquisa..."
                    : "Conte quais tipos de editais ou chamadas sua instituição promove..."
                }
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-(--primary) text-white font-semibold hover:bg-(--primary-hover) disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting
                ? "Criando conta..."
                : userType === "ARTIST"
                ? "Cadastrar como Artista"
                : "Cadastrar como Propositor"}
            </button>
          </form>

          <p className="mt-6 text-center text-(--text-muted) text-sm">
            Já possui uma conta?{" "}
            <Link href="/login" className="text-(--primary-fg) font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}