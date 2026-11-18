"use client";

import { useState } from "react";
import Link from "next/link";
import {
  computeProfileCoverage,
  EMPTY_ONBOARDING,
  INTEREST_OPTIONS,
  ONBOARDING_STEPS,
  type OnboardingValues,
} from "@/shared/lib/onboarding";
import { TextInput, TextAreaInput } from "@/shared/components/atoms/FormControls";
import FormField from "@/shared/components/molecules/FormField";
import LanguageGroupPicker from "@/shared/components/molecules/LanguageGroupPicker";
import LanguageChips from "@/shared/components/molecules/LanguageChips";
import TriStateField from "@/shared/components/molecules/TriStateField";

function toggleIn(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

// As respostas vivem só nesta tela: ainda não há perfil persistido para recebê-las (O4).
export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [values, setValues] = useState<OnboardingValues>(EMPTY_ONBOARDING);
  const patch = (changes: Partial<OnboardingValues>) => setValues((prev) => ({ ...prev, ...changes }));

  if (done) {
    const coverage = computeProfileCoverage(values);
    return (
      <div className="p-5 sm:p-6 space-y-4">
        <h2 className="text-xl font-bold text-(--foreground)">Perfil criado</h2>
        <p role="status" className="text-sm text-(--text-muted)">
          Você preencheu {coverage.filled} de {coverage.total} campos ({Math.round(coverage.fraction * 100)}%). O que ficou em branco
          conta como desconhecido, nunca como zero: você continua recebendo recomendações.
        </p>
        {coverage.missing.length > 0 && (
          <div>
            <p className="text-sm font-bold text-(--foreground)">Para melhorar suas recomendações, falta informar:</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-(--text-muted)">
              {coverage.missing.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>
        )}
        <Link href="/" className="inline-flex px-5 py-2.5 rounded-xl bg-(--primary) text-white text-sm font-bold hover:bg-(--primary-hover)">
          Ir para o feed
        </Link>
      </div>
    );
  }

  const isLast = step === ONBOARDING_STEPS.length - 1;

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <p role="note" className="rounded-xl bg-(--accent-soft) border border-(--accent) px-4 py-3 text-sm text-(--accent-ink)">
        Prévia: as respostas ainda não são gravadas. Nenhum campo é obrigatório, e você pode pular qualquer etapa.
      </p>

      <ol aria-label="Etapas" className="flex gap-2 text-xs font-bold">
        {ONBOARDING_STEPS.map((name, i) => (
          <li
            key={name}
            aria-current={i === step ? "step" : undefined}
            className={`flex-1 rounded-lg px-2 py-1.5 text-center ${i === step ? "bg-(--primary-soft) text-(--primary-fg)" : "bg-(--surface-subtle) text-(--text-muted)"}`}
          >
            {i + 1}. {name}
          </li>
        ))}
      </ol>

      <section aria-label={ONBOARDING_STEPS[step]} className="space-y-4">
        {step === 0 && (
          <>
            <FormField id="ob-name" label="Nome artístico">
              <TextInput id="ob-name" value={values.artisticName} onChange={(e) => patch({ artisticName: e.target.value })} />
            </FormField>
            <FormField id="ob-bio" label="Biografia">
              <TextAreaInput id="ob-bio" rows={3} value={values.bio} onChange={(e) => patch({ bio: e.target.value })} />
            </FormField>
            <FormField id="ob-statement" label="Declaração artística">
              <TextAreaInput id="ob-statement" rows={3} value={values.statement} onChange={(e) => patch({ statement: e.target.value })} />
            </FormField>
          </>
        )}
        {step === 1 && (
          <>
            <LanguageGroupPicker selected={values.languages} onChange={(languages) => patch({ languages })} />
            <FormField id="ob-tech" label="Técnicas e suportes (separe por vírgula)">
              <TextInput id="ob-tech" value={values.techniques} onChange={(e) => patch({ techniques: e.target.value })} />
            </FormField>
          </>
        )}
        {step === 2 && (
          <>
            <FormField id="ob-themes" label="Temas e conceitos (separe por vírgula)">
              <TextInput id="ob-themes" value={values.themes} onChange={(e) => patch({ themes: e.target.value })} />
            </FormField>
            <FormField id="ob-pos" label="Posicionamento artístico">
              <TextInput id="ob-pos" value={values.positioning} onChange={(e) => patch({ positioning: e.target.value })} />
            </FormField>
          </>
        )}
        {step === 3 && (
          <>
            <LanguageChips
              title="O que você procura"
              tags={[...INTEREST_OPTIONS]}
              selected={values.interests}
              variant="core"
              onToggle={(tag) => patch({ interests: toggleIn(values.interests, tag) })}
            />
            <TriStateField name="travel" label="Pode viajar para se apresentar?" value={values.canTravel} onChange={(canTravel) => patch({ canTravel })} />
            <TriStateField name="team" label="Tem equipe?" value={values.hasTeam} onChange={(hasTeam) => patch({ hasTeam })} />
            <TriStateField name="docs" label="Documentação completa e em dia?" value={values.hasDocumentation} onChange={(hasDocumentation) => patch({ hasDocumentation })} />
          </>
        )}
      </section>

      <div className="flex items-center justify-between gap-3 border-t border-(--border-subtle) pt-4">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="px-4 py-2 rounded-xl border border-(--border-subtle) text-sm font-semibold text-(--text-muted) hover:bg-(--surface-subtle) disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          Voltar
        </button>
        <div className="flex gap-2">
          {!isLast && (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-(--text-muted) hover:bg-(--surface-subtle) cursor-pointer"
            >
              Pular etapa
            </button>
          )}
          <button
            type="button"
            onClick={() => (isLast ? setDone(true) : setStep((s) => s + 1))}
            className="px-5 py-2 rounded-xl bg-(--primary) text-white text-sm font-bold hover:bg-(--primary-hover) cursor-pointer"
          >
            {isLast ? "Concluir" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
