"use client";

import { useState } from "react";

import { Button } from "@/shared/components/atoms/Button";
import { Select } from "@/shared/components/atoms/Select";
import { ConfirmDialog } from "@/shared/components/molecules/ConfirmDialog";
import { FormField } from "@/shared/components/molecules/FormField";
import { PageHeader } from "@/shared/components/molecules/PageHeader";

type ProfilePrivacyProps = { email: string; onExport?: () => void; onDelete?: () => void };

export function ProfilePrivacy({ email, onExport, onDelete }: ProfilePrivacyProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="Perfil e privacidade" description={email} />
      <section className="flex flex-col gap-4 rounded-xl bg-surface p-6 border border-line" aria-label="Visibilidade">
        <FormField label="Quem vê o seu portfólio" hint="Organizações só veem artistas que se candidataram.">
          {(control) => (
            <Select {...control} defaultValue="candidaturas">
              <option value="privado">Só eu</option>
              <option value="candidaturas">Organizações dos editais em que me candidatei</option>
              <option value="publico">Qualquer pessoa autenticada</option>
            </Select>
          )}
        </FormField>
      </section>
      <section className="flex flex-col gap-3 rounded-xl bg-surface p-6 border border-line" aria-label="Seus dados">
        <h2 className="font-semibold text-ink">Seus dados</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              onExport?.();
              setNotice("Pedido de exportação registrado. Enviaremos o arquivo por e-mail.");
            }}
          >
            Exportar meus dados
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Excluir minha conta
          </Button>
        </div>
        {notice && (
          <p role="status" className="text-sm text-ink-muted">
            {notice}
          </p>
        )}
      </section>
      <ConfirmDialog
        open={confirmOpen}
        destructive
        title="Excluir a conta?"
        description="Seus dados, obras e candidaturas serão apagados. Não dá para desfazer."
        confirmLabel="Excluir conta"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          onDelete?.();
          setConfirmOpen(false);
          setNotice("Pedido de exclusão registrado.");
        }}
      />
    </>
  );
}
