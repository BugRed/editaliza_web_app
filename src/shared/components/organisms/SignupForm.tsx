"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { BRAZILIAN_STATES } from "@/app/lib/user-profiles";
import { formatCnpj, formatCpf } from "@/shared/lib/documents";
import { PASSWORD_MIN_LENGTH } from "@/shared/lib/password-policy";
import { checkSignup, type SignupUserType } from "@/shared/lib/signup-validation";
import { TextInput, SelectInput, TextAreaInput } from "@/shared/components/atoms/FormControls";
import AvatarPicker from "@/shared/components/molecules/AvatarPicker";
import FormField from "@/shared/components/molecules/FormField";
import PasswordChecklist from "@/shared/components/molecules/PasswordChecklist";
import UserTypeTabs from "@/shared/components/molecules/UserTypeTabs";
import SignupArtistFields, { type SignupArtistValues } from "@/shared/components/organisms/SignupArtistFields";

interface SignupValues extends SignupArtistValues {
  name: string;
  handle: string;
  email: string;
  password: string;
  city: string;
  stateUf: string;
  bio: string;
  cpf: string;
  cnpj: string;
  avatarDataUrl: string;
}

const INITIAL_VALUES: SignupValues = {
  name: "",
  handle: "",
  email: "",
  password: "",
  city: "",
  stateUf: "",
  bio: "",
  cpf: "",
  cnpj: "",
  avatarDataUrl: "",
  territoryScope: "ESTADUAL",
  profileLevel: "INICIANTE",
  experienceYears: 1,
  coreLanguages: ["Pintura"],
  hasCnpjOrMei: false,
  hasTechnicalFormation: false,
};

const COPY = {
  ARTIST: {
    name: "Nome completo",
    namePlaceholder: "Ex: Clara Mendes",
    city: "Cidade",
    cityPlaceholder: "Ex: Recife",
    bio: "Sobre seu trabalho artístico",
    bioPlaceholder: "Conte brevemente o que você cria e pesquisa...",
    avatar: "Sua foto de perfil",
    avatarHint: "Aparece no seu perfil e nos posts. JPG, PNG ou WebP; recortamos em quadrado.",
    submit: "Cadastrar como Artista",
  },
  PROPOSER: {
    name: "Nome da instituição",
    namePlaceholder: "Ex: Instituto Cultural Sol",
    city: "Cidade sede",
    cityPlaceholder: "Ex: São Paulo",
    bio: "Sobre a organização propositora",
    bioPlaceholder: "Conte quais tipos de editais ou chamadas sua instituição promove...",
    avatar: "Logo da instituição",
    avatarHint:
      "Opcional: aparece no perfil da empresa e nos editais. Sem logo, usamos uma imagem padrão. Você pode enviar depois.",
    submit: "Cadastrar como Propositor",
  },
} as const;

export default function SignupForm() {
  const { register } = useAuth();
  const [userType, setUserType] = useState<SignupUserType>("ARTIST");
  const [values, setValues] = useState<SignupValues>(INITIAL_VALUES);
  const [erro, setErro] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patch = (changes: Partial<SignupValues>) => setValues((prev) => ({ ...prev, ...changes }));
  const isArtist = userType === "ARTIST";
  const copy = COPY[userType];
  // Os ids dos campos de localização diferem por papel, como na versão anterior da tela.
  const locationId = isArtist ? "cad" : "cad-p";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const problem = checkSignup({ userType, ...values });
    if (problem) {
      setErro(problem.message);
      if (problem.avatarMessage) setAvatarError(problem.avatarMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        userType,
        name: values.name.trim(),
        handle: values.handle.trim() || undefined,
        email: values.email.trim(),
        password: values.password,
        avatarDataUrl: values.avatarDataUrl || undefined,
        city: values.city.trim(),
        state: values.stateUf.trim(),
        bio: values.bio.trim(),
        cpf: isArtist ? values.cpf : undefined,
        territoryScope: isArtist ? values.territoryScope : undefined,
        profileLevel: isArtist ? values.profileLevel : undefined,
        experienceYears: isArtist ? values.experienceYears : undefined,
        coreLanguages: isArtist ? values.coreLanguages : undefined,
        hasCnpjOrMei: isArtist ? values.hasCnpjOrMei : undefined,
        hasTechnicalFormation: isArtist ? values.hasTechnicalFormation : undefined,
        cnpj: isArtist ? undefined : values.cnpj,
      });
      if (!res.success) setErro(res.message || "Não foi possível concluir o cadastro.");
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <UserTypeTabs
        value={userType}
        onChange={(type) => {
          setUserType(type);
          setErro("");
        }}
      />

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
          label={copy.avatar}
          required={isArtist}
          hint={copy.avatarHint}
          value={values.avatarDataUrl}
          onChange={(value) => {
            patch({ avatarDataUrl: value });
            setAvatarError("");
          }}
          error={avatarError}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="cad-name" label={copy.name}>
            <TextInput
              id="cad-name"
              type="text"
              required
              placeholder={copy.namePlaceholder}
              value={values.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </FormField>
          <FormField id="cad-handle" label="Usuário (@)">
            <TextInput
              id="cad-handle"
              type="text"
              placeholder="@seu.usuario"
              value={values.handle}
              onChange={(e) => patch({ handle: e.target.value })}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="cad-email" label="E-mail">
            <TextInput
              id="cad-email"
              type="email"
              name="email"
              required
              placeholder="seu@email.com"
              value={values.email}
              onChange={(e) => patch({ email: e.target.value })}
            />
          </FormField>
          <FormField id="cad-password" label="Senha">
            <TextInput
              id="cad-password"
              type="password"
              name="password"
              required
              placeholder="Crie uma senha forte"
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
              aria-describedby="cad-password-rules"
              value={values.password}
              onChange={(e) => patch({ password: e.target.value })}
            />
            <div id="cad-password-rules">
              <PasswordChecklist password={values.password} />
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isArtist ? (
            <FormField id="cad-cpf" label="CPF (opcional)">
              <TextInput
                id="cad-cpf"
                type="text"
                placeholder="000.000.000-00"
                inputMode="numeric"
                autoComplete="off"
                maxLength={14}
                value={values.cpf}
                onChange={(e) => patch({ cpf: formatCpf(e.target.value) })}
              />
            </FormField>
          ) : (
            <FormField id="cad-cnpj" label="CNPJ da organização">
              <TextInput
                id="cad-cnpj"
                type="text"
                required
                placeholder="00.000.000/0001-00"
                inputMode="numeric"
                autoComplete="off"
                maxLength={18}
                value={values.cnpj}
                onChange={(e) => patch({ cnpj: formatCnpj(e.target.value) })}
              />
            </FormField>
          )}
          <FormField id={`${locationId}-city`} label={copy.city}>
            <TextInput
              id={`${locationId}-city`}
              type="text"
              placeholder={copy.cityPlaceholder}
              value={values.city}
              onChange={(e) => patch({ city: e.target.value })}
            />
          </FormField>
          <FormField id={`${locationId}-uf`} label="Estado (UF)">
            <SelectInput
              id={`${locationId}-uf`}
              value={values.stateUf}
              onChange={(e) => patch({ stateUf: e.target.value })}
            >
              <option value="">UF</option>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        {isArtist && <SignupArtistFields values={values} onChange={patch} />}

        <FormField id="cad-bio" label={copy.bio}>
          <TextAreaInput
            id="cad-bio"
            rows={2}
            placeholder={copy.bioPlaceholder}
            value={values.bio}
            onChange={(e) => patch({ bio: e.target.value })}
          />
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-(--primary) text-white font-semibold hover:bg-(--primary-hover) disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isSubmitting ? "Criando conta..." : copy.submit}
        </button>
      </form>
    </>
  );
}
