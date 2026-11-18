"use client";

import { useState } from "react";
import { DELETE_CONFIRMATION_WORD, isDeleteConfirmed } from "@/shared/lib/privacy";
import { TextInput } from "@/shared/components/atoms/FormControls";

interface DeleteAccountDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteAccountDialog({ onConfirm, onCancel }: DeleteAccountDialogProps) {
  const [typed, setTyped] = useState("");
  const confirmed = isDeleteConfirmed(typed);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim)/40 px-4"
    >
      <div className="w-full max-w-md rounded-xl border border-(--border-subtle) bg-(--bg-card) p-5 space-y-4 shadow-lg">
        <h2 id="delete-title" className="text-lg font-bold text-(--foreground)">
          Excluir sua conta?
        </h2>
        <p className="text-sm text-(--text-muted)">
          Seu perfil, suas obras e seus selos saem do ar e não podem ser recuperados. Baixe seus dados antes, se quiser guardá-los.
        </p>
        <div className="space-y-1.5">
          <label htmlFor="delete-confirm" className="block text-sm font-bold text-(--foreground)">
            Digite {DELETE_CONFIRMATION_WORD} para confirmar
          </label>
          <TextInput
            id="delete-confirm"
            type="text"
            autoComplete="off"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-(--border-subtle) text-sm font-semibold text-(--text-muted) hover:bg-(--surface-subtle) cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!confirmed}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-(--danger) text-white text-sm font-bold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Excluir minha conta
          </button>
        </div>
      </div>
    </div>
  );
}
