"use client";

import { useEffect, useId, useState } from "react";

import { Button } from "@/shared/components/atoms/Button";
import { Select } from "@/shared/components/atoms/Select";

export const REJECT_REASONS = [
  "Não é para a minha linguagem artística",
  "Não sou elegível",
  "Prazo curto demais",
  "Valor não compensa",
  "Outro motivo",
] as const;

type RejectReasonDialogProps = { open: boolean; onConfirm: (reason: string) => void; onCancel: () => void };

// O motivo é obrigatório: é ele que alimenta o feedback do motor (spec §20).
export function RejectReasonDialog({ open, onConfirm, onCancel }: RejectReasonDialogProps) {
  const [reason, setReason] = useState("");
  const titleId = useId();
  const selectId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-md rounded-lg bg-surface p-6 shadow-float">
        <h2 id={titleId} className="text-lg font-semibold text-ink">
          Por que este edital não serve?
        </h2>
        <label htmlFor={selectId} className="mt-4 block text-sm font-medium text-ink">
          Motivo
        </label>
        <Select id={selectId} value={reason} onChange={(event) => setReason(event.target.value)}>
          <option value="">Escolha um motivo</option>
          {REJECT_REASONS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button disabled={!reason} onClick={() => onConfirm(reason)}>
            Dispensar edital
          </Button>
        </div>
      </div>
    </div>
  );
}
