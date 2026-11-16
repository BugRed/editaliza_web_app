"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Palette, Sun } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { ALL_ART_TAGS, BRAZILIAN_STATES } from "@/app/lib/user-profiles";
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

  const toggleLanguage = (tag: string) => {
    setCoreLanguages((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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

    const senhaRegex = /^(?=.*\d).{6,}$/;
    if (!senhaRegex.test(password)) {
      setErro("A senha deve ter pelo menos 6 caracteres e 1 número.");
      return;
    }

    if (userType === "ARTIST") {
      const cpfDigits = cpf.replace(/\D/g, "");
      if (cpfDigits && cpfDigits.length !== 11) {
        setErro("Se informado, o CPF deve ter 11 dígitos.");
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

    setIsSubmitting(true);
    try {
      const res = await register({
        userType,
        name: name.trim(),
        handle: handle.trim() || undefined,
        email: email.trim(),
        password,
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFB] px-4 py-10">
      <div className="w-full max-w-xl bg-white border border-[#DCE6E8] rounded-xl shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0E7C86] via-[#0E7C86] to-[#FFB800]" />

        <div className="p-6 sm:p-8 flex flex-col">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#FFB800] text-[#102A30] flex items-center justify-center mb-3 shadow-xs">
              <Sun size={26} strokeWidth={2.2} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0E7C86]">
              Criar conta no Editaliza
            </h1>
            <p className="text-sm text-[#4A656B] mt-1">
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
                  ? "bg-[#E6F4F5] border-[#0E7C86] text-[#0E7C86]"
                  : "bg-[#F8FAFB] border-[#DCE6E8] text-[#4A656B] hover:border-[#0E7C86]"
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
                  ? "bg-[#FFF6D6] border-[#FFB800] text-[#7A5400]"
                  : "bg-[#F8FAFB] border-[#DCE6E8] text-[#4A656B] hover:border-[#FFB800]"
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
                className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm"
              >
                {erro}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cad-name" className="block text-sm font-medium text-[#102A30]">
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
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cad-handle" className="block text-sm font-medium text-[#102A30]">
                  Usuário (@)
                </label>
                <input
                  id="cad-handle"
                  type="text"
                  placeholder="@seu.usuario"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cad-email" className="block text-sm font-medium text-[#102A30]">
                  E-mail
                </label>
                <input
                  id="cad-email"
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cad-password" className="block text-sm font-medium text-[#102A30]">
                  Senha
                </label>
                <input
                  id="cad-password"
                  type="password"
                  name="password"
                  placeholder="Mínimo 6 caracteres e 1 número"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
                  required
                />
              </div>
            </div>

            {/* Documento específico por papel */}
            {userType === "ARTIST" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="cad-cpf" className="block text-sm font-medium text-[#102A30]">
                    CPF (opcional)
                  </label>
                  <input
                    id="cad-cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cad-city" className="block text-sm font-medium text-[#102A30]">
                    Cidade
                  </label>
                  <input
                    id="cad-city"
                    type="text"
                    placeholder="Ex: Recife"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cad-uf" className="block text-sm font-medium text-[#102A30]">
                    Estado (UF)
                  </label>
                  <select
                    id="cad-uf"
                    value={stateUf}
                    onChange={(e) => setStateUf(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
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
                  <label htmlFor="cad-cnpj" className="block text-sm font-medium text-[#102A30]">
                    CNPJ da organização
                  </label>
                  <input
                    id="cad-cnpj"
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cad-p-city" className="block text-sm font-medium text-[#102A30]">
                    Cidade sede
                  </label>
                  <input
                    id="cad-p-city"
                    type="text"
                    placeholder="Ex: São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cad-p-uf" className="block text-sm font-medium text-[#102A30]">
                    Estado (UF)
                  </label>
                  <select
                    id="cad-p-uf"
                    value={stateUf}
                    onChange={(e) => setStateUf(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
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
                    <label htmlFor="cad-scope" className="block text-sm font-medium text-[#102A30]">
                      Atuação
                    </label>
                    <select
                      id="cad-scope"
                      value={territoryScope}
                      onChange={(e) =>
                        setTerritoryScope(e.target.value as TerritoryScope)
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
                    >
                      <option value="MUNICIPAL">Municipal</option>
                      <option value="METROPOLITANO">Metropolitano</option>
                      <option value="ESTADUAL">Estadual</option>
                      <option value="NACIONAL">Nacional</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="cad-level" className="block text-sm font-medium text-[#102A30]">
                      Momento
                    </label>
                    <select
                      id="cad-level"
                      value={profileLevel}
                      onChange={(e) =>
                        setProfileLevel(e.target.value as ProfileLevel)
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
                    >
                      <option value="INICIANTE">Iniciante</option>
                      <option value="EMERGENTE">Emergente</option>
                      <option value="CONSOLIDADO">Consolidado</option>
                      <option value="MESTRE">Mestre</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="cad-exp" className="block text-sm font-medium text-[#102A30]">
                      Anos de prática
                    </label>
                    <input
                      id="cad-exp"
                      type="number"
                      min={0}
                      max={70}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-[#102A30]">
                    Linguagens principais
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ALL_ART_TAGS.map((tag) => {
                      const active = coreLanguages.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleLanguage(tag)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            active
                              ? "bg-[#0E7C86] border-[#0E7C86] text-white"
                              : "bg-white border-[#DCE6E8] text-[#4A656B] hover:border-[#0E7C86]"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-5 pt-1">
                  <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#102A30] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCnpjOrMei}
                      onChange={(e) => setHasCnpjOrMei(e.target.checked)}
                      className="w-4 h-4 accent-[#0E7C86] rounded"
                    />
                    <span>Possuo CNPJ ou MEI cultural</span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#102A30] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasTechnicalFormation}
                      onChange={(e) => setHasTechnicalFormation(e.target.checked)}
                      className="w-4 h-4 accent-[#0E7C86] rounded"
                    />
                    <span>Possuo formação técnica</span>
                  </label>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label htmlFor="cad-bio" className="block text-sm font-medium text-[#102A30]">
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
                className="w-full px-3.5 py-2 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0E7C86] text-white font-semibold hover:bg-[#0B656D] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting
                ? "Criando conta..."
                : userType === "ARTIST"
                ? "Cadastrar como Artista"
                : "Cadastrar como Propositor"}
            </button>
          </form>

          <p className="mt-6 text-center text-[#4A656B] text-sm">
            Já possui uma conta?{" "}
            <Link href="/login" className="text-[#0E7C86] font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}