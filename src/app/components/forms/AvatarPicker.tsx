"use client";

import { Camera } from "lucide-react";
import { useId, useState } from "react";

import { fileToAvatarDataUrl, ImageUploadError } from "@/app/lib/image-upload";

interface AvatarPickerProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (dataUrl: string) => void;
  error?: string;
  /** Padrão: obrigatório (asterisco). Empresa: logo opcional. */
  required?: boolean;
}

export default function AvatarPicker({ label, hint, value, onChange, error, required = true }: AvatarPickerProps) {
  const inputId = useId();
  const [localError, setLocalError] = useState("");
  const [busy, setBusy] = useState(false);
  const shownError = localError || error;

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite escolher o mesmo arquivo de novo depois de um erro
    if (!file) return;
    setLocalError("");
    setBusy(true);
    try {
      onChange(await fileToAvatarDataUrl(file));
    } catch (failure) {
      setLocalError(failure instanceof ImageUploadError ? failure.message : "Não foi possível usar essa foto.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-(--foreground)">
        {label}{" "}
        {required ? (
          <span className="font-normal text-(--danger)" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="font-normal text-(--text-subtle)">(opcional)</span>
        )}
      </span>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-(--surface-subtle) ${
            shownError ? "border-(--danger)" : value ? "border-(--primary-fg)" : "border-dashed border-(--border-strong)"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL local, sem domínio para o next/image
            <img src={value} alt="Prévia da sua foto" className="h-full w-full object-cover" />
          ) : (
            <Camera size={26} className="text-(--text-subtle)" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 space-y-1">
          <label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-card) px-3.5 py-2 text-sm font-semibold text-(--foreground) transition-colors hover:bg-(--surface-subtle) focus-within:outline-2 focus-within:outline-(--primary-fg)"
          >
            {busy ? "Preparando..." : value ? "Trocar foto" : "Escolher foto"}
          </label>
          <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="sr-only" aria-describedby={`${inputId}-hint`} />
          <p id={`${inputId}-hint`} className="text-xs text-(--text-subtle)">
            {hint ?? "JPG, PNG ou WebP. Recortamos em quadrado."}
          </p>
        </div>
      </div>
      {shownError && (
        <p role="alert" className="text-xs font-semibold text-(--danger)">
          {shownError}
        </p>
      )}
    </div>
  );
}
