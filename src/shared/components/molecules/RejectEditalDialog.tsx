"use client";

import { useState } from "react";
import { checkRejection, REJECTION_REASONS, type RejectionReason } from "@/shared/lib/rejection";
import { TextInput } from "@/shared/components/atoms/FormControls";

interface RejectEditalDialogProps {
  onConfirm: (reason: RejectionReason, otherText: string) => void;
  onCancel: () => void;
}

export default function RejectEditalDialog({ onConfirm, onCancel }: RejectEditalDialogProps) {
  const [reason, setReason] = useState<RejectionReason | "">("");
  const [otherText, setOtherText] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const problem = checkRejection({ reason, otherText });
    if (problem || !reason) {
      setError(problem ?? "Escolha o motivo.");
      return;
    }
    onConfirm(reason, otherText.trim());
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="reject-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-(--scrim)/40 px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-(--border-subtle) bg-(--bg-card) p-5 shadow-lg">
        <div>
          <h2 id="reject-title" className="text-lg font-bold text-(--foreground)">
            Por que este edital não serve?
          </h2>
          <p className="text-sm text-(--text-muted)">Isso ajuda a recomendar melhor. Não aparece para ninguém.</p>
        </div>

        <fieldset className="space-y-2">
          <legend className="sr-only">Motivo</legend>
          {REJECTION_REASONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm text-(--foreground) cursor-pointer">
              <input type="radio" name="reject-reason" value={option.value} checked={reason === option.value} onChange={() => setReason(option.value)} className="accent-(--primary-fg)" />
              {option.label}
            </label>
          ))}
        </fieldset>

        {reason === "OTHER" && (
          <TextInput aria-label="Conte o motivo" placeholder="Conte em poucas palavras" value={otherText} onChange={(e) => setOtherText(e.target.value)} />
        )}

        {error && (
          <p role="alert" className="text-sm text-(--danger)">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-(--border-subtle) text-sm font-semibold text-(--text-muted) hover:bg-(--surface-subtle) cursor-pointer">
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm} className="px-4 py-2 rounded-xl bg-(--primary) text-white text-sm font-bold hover:bg-(--primary-hover) cursor-pointer">
            Dispensar edital
          </button>
        </div>
      </div>
    </div>
  );
}
