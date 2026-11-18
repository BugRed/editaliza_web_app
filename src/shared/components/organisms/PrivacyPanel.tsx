"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { buildDataExport, exportFileName, VISIBILITY_OPTIONS, type PortfolioVisibility } from "@/shared/lib/privacy";
import CheckboxField from "@/shared/components/molecules/CheckboxField";
import DeleteAccountDialog from "@/shared/components/molecules/DeleteAccountDialog";
import SettingsSection from "@/shared/components/molecules/SettingsSection";

interface PrivacyPanelProps {
  /** Dados do próprio usuário, na forma em que a tela os tem hoje. */
  profile: object;
}

function downloadJson(content: string, fileName: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

// Estas escolhas vivem só nesta tela: ainda não há conta nem banco para gravá-las (O2).
export default function PrivacyPanel({ profile }: PrivacyPanelProps) {
  const [visibility, setVisibility] = useState<PortfolioVisibility>("PUBLIC");
  const [personalizedRecs, setPersonalizedRecs] = useState(true);
  const [exported, setExported] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  const handleExport = () => {
    const now = new Date();
    downloadJson(buildDataExport(profile, now), exportFileName(now));
    setExported(true);
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <p role="note" className="rounded-xl bg-(--accent-soft) border border-(--accent) px-4 py-3 text-sm text-(--accent-ink)">
        Prévia: estas escolhas ainda não são gravadas, porque a conta real chega na próxima etapa.
      </p>

      <SettingsSection title="Quem vê seu portfólio" description="Você decide quem pode ver seu perfil e suas obras.">
        <fieldset className="space-y-2">
          <legend className="sr-only">Visibilidade do portfólio</legend>
          {VISIBILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-3 rounded-xl border border-(--border-subtle) p-3 cursor-pointer has-[:checked]:border-(--primary-fg) has-[:checked]:bg-(--primary-soft)"
            >
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={visibility === option.value}
                onChange={() => setVisibility(option.value)}
                className="mt-1 accent-(--primary-fg)"
              />
              <span>
                <span className="block text-sm font-bold text-(--foreground)">{option.label}</span>
                <span className="block text-xs text-(--text-muted)">{option.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <CheckboxField
          label="Usar meu perfil para recomendar editais"
          checked={personalizedRecs}
          onChange={setPersonalizedRecs}
        />
      </SettingsSection>

      <SettingsSection
        title="Seus dados"
        description="Baixe uma cópia de tudo o que o Editaliza guarda sobre você, em um arquivo que outro sistema consegue ler."
      >
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-(--border-subtle) bg-(--bg-card) text-sm font-bold text-(--foreground) hover:bg-(--surface-subtle) cursor-pointer"
        >
          <Download size={16} />
          Baixar meus dados
        </button>
        {exported && (
          <p role="status" className="text-sm text-(--primary-ink)">
            Arquivo gerado. Confira a pasta de downloads.
          </p>
        )}
      </SettingsSection>

      <SettingsSection
        tone="danger"
        title="Excluir conta"
        description="Apaga seu perfil, suas obras e seus selos. Não dá para desfazer."
      >
        {deleteRequested ? (
          <p role="status" className="text-sm text-(--text-muted)">
            Pedido de exclusão registrado nesta prévia. Nenhum dado foi apagado.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setDeleting(true)}
            className="px-4 py-2 rounded-xl border border-(--danger-border) text-sm font-bold text-(--danger) hover:bg-(--danger-soft) cursor-pointer"
          >
            Excluir minha conta
          </button>
        )}
      </SettingsSection>

      {deleting && (
        <DeleteAccountDialog
          onCancel={() => setDeleting(false)}
          onConfirm={() => {
            setDeleting(false);
            setDeleteRequested(true);
          }}
        />
      )}
    </div>
  );
}
