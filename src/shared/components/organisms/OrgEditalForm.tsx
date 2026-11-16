"use client";

import { useState } from "react";

import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Select } from "@/shared/components/atoms/Select";
import { Textarea } from "@/shared/components/atoms/Textarea";
import { FormField } from "@/shared/components/molecules/FormField";
import { PageHeader } from "@/shared/components/molecules/PageHeader";

type OrgEditalFormProps = { onSaveDraft?: (title: string) => void };

export function OrgEditalForm({ onSaveDraft }: OrgEditalFormProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSaved(false);
    if (!title.trim()) {
      setError("Dê um título ao edital.");
      return;
    }
    setError(undefined);
    onSaveDraft?.(title.trim());
    setSaved(true);
  }

  return (
    <>
      <PageHeader title="Publicar edital" description="Descreva o edital e o que ele exige. Você pode salvar como rascunho." />
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-surface p-6 border border-line">
        <FormField label="Título" error={error}>
          {(control) => <Input {...control} value={title} onChange={(event) => setTitle(event.target.value)} />}
        </FormField>
        <FormField label="Tipo de oportunidade">
          {(control) => (
            <Select {...control}>
              <option>Prêmio</option>
              <option>Bolsa</option>
              <option>Residência</option>
              <option>Exposição</option>
              <option>Fomento</option>
            </Select>
          )}
        </FormField>
        <FormField label="Território">{(control) => <Input {...control} placeholder="Ex.: Pernambuco" />}</FormField>
        <FormField label="Requisitos" hint="Um por linha. Marque depois o que é essencial.">
          {(control) => <Textarea {...control} />}
        </FormField>
        <FormField label="Anexo (PDF)">{(control) => <Input {...control} type="file" accept="application/pdf" className="py-2" />}</FormField>
        <div className="flex items-center gap-3">
          <Button type="submit">Salvar rascunho</Button>
          {saved && <p role="status" className="text-sm text-ink-muted">Rascunho salvo.</p>}
        </div>
      </form>
    </>
  );
}
