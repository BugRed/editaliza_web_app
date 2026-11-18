"use client";

import { useState } from "react";
import { rejectionLabel, type RejectionReason } from "@/shared/lib/rejection";
import RejectEditalDialog from "@/shared/components/molecules/RejectEditalDialog";

// O motivo fica só nesta tela: o feed ainda não aprende com ele (O5).
export default function RejectEditalControl() {
  const [open, setOpen] = useState(false);
  const [rejected, setRejected] = useState<{ reason: RejectionReason; otherText: string } | null>(null);

  if (rejected) {
    const label = rejected.reason === "OTHER" ? rejected.otherText : rejectionLabel(rejected.reason);
    return (
      <p role="status" className="text-sm text-(--text-muted)">
        Você dispensou este edital: {label}.{" "}
        <button type="button" onClick={() => setRejected(null)} className="font-semibold text-(--primary-fg) hover:underline cursor-pointer">
          Desfazer
        </button>
      </p>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold text-(--text-muted) hover:text-(--danger) hover:underline cursor-pointer">
        Não tenho interesse
      </button>
      {open && (
        <RejectEditalDialog
          onCancel={() => setOpen(false)}
          onConfirm={(reason, otherText) => {
            setOpen(false);
            setRejected({ reason, otherText });
          }}
        />
      )}
    </>
  );
}
