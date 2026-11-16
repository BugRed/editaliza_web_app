"use client";

import { useState } from "react";

import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Select } from "@/shared/components/atoms/Select";
import { FormField } from "@/shared/components/molecules/FormField";
import { PageHeader } from "@/shared/components/molecules/PageHeader";
import { StepIndicator } from "@/shared/components/molecules/StepIndicator";

const STEPS = ["Identidade", "Linguagens", "Disponibilidade"] as const;

type OnboardingWizardProps = { onFinish?: () => void };

// Nenhuma etapa é obrigatória: campo em branco vira "desconhecido" no motor, nunca erro.
export function OnboardingWizard({ onFinish }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const last = step === STEPS.length - 1;

  if (done) {
    return (
      <>
        <PageHeader title="Perfil criado" description="Você pode completar o que faltou quando quiser, em Perfil." />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Conte sobre a sua arte" description="Tudo é opcional. Quanto mais você informa, melhor a gente entende o que serve para você." />
      <StepIndicator steps={[...STEPS]} currentIndex={step} />
      <form className="flex flex-col gap-4 rounded-lg bg-surface p-6 shadow-card" onSubmit={(event) => event.preventDefault()}>
        {step === 0 && (
          <>
            <FormField label="Nome artístico">{(control) => <Input {...control} />}</FormField>
            <FormField label="Cidade e estado">{(control) => <Input {...control} />}</FormField>
          </>
        )}
        {step === 1 && (
          <>
            <FormField label="Linguagem principal">
              {(control) => (
                <Select {...control}>
                  <option value="">Prefiro não informar</option>
                  <option>Artes visuais</option>
                  <option>Música</option>
                  <option>Teatro</option>
                  <option>Dança</option>
                  <option>Audiovisual</option>
                  <option>Literatura</option>
                </Select>
              )}
            </FormField>
            <FormField label="Técnicas que você usa" hint="Separe por vírgula.">
              {(control) => <Input {...control} />}
            </FormField>
          </>
        )}
        {step === 2 && (
          <FormField label="Disponibilidade para viajar">
            {(control) => (
              <Select {...control}>
                <option value="">Prefiro não informar</option>
                <option>Só na minha cidade</option>
                <option>No meu estado</option>
                <option>Em todo o Brasil</option>
              </Select>
            )}
          </FormField>
        )}
        <div className="flex justify-between gap-3">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>
            Voltar
          </Button>
          <Button
            onClick={() => {
              if (!last) return setStep((value) => value + 1);
              onFinish?.();
              setDone(true);
            }}
          >
            {last ? "Concluir" : "Continuar"}
          </Button>
        </div>
      </form>
    </>
  );
}
