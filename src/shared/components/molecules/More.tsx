"use client";

import React, { useState } from "react";
import styles from "./more.module.css";
import {
  Share2,
  BookmarkIcon,
  BookmarkCheckIcon,
  EyeOffIcon,
  FlagIcon,
  X,
} from "lucide-react";

type MoreProps = {
  isSaved: boolean;
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
};

export default function More({ isSaved, isOpen, onClose, title }: MoreProps) {
  const [isCardSaved, setIsCardSaved] = useState(isSaved);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
        setFeedback("Link copiado para a área de transferência.");
      }
    } catch {
      setFeedback(`Edital: ${title || "Editaliza"}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Opções do edital"
      className={`${styles.more} ${
        isOpen ? styles.openMoreAnimation : styles.closeMoreAnimation
      }`}
    >
      <div className={styles.sheetHeader}>
        <div aria-hidden="true" className={styles.holdMore} />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className={styles.closeBtn}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {feedback && <p className={styles.feedback}>{feedback}</p>}

      <button type="button" className={styles.action} onClick={handleShare}>
        <Share2 size={18} /> Compartilhar
      </button>

      <button
        type="button"
        className={styles.action}
        onClick={() => setIsCardSaved(!isCardSaved)}
      >
        {isCardSaved ? (
          <>
            <BookmarkCheckIcon size={18} /> Salvo nos favoritos
          </>
        ) : (
          <>
            <BookmarkIcon size={18} /> Salvar
          </>
        )}
      </button>

      <button
        type="button"
        className={styles.action}
        onClick={() => {
          setFeedback("Preferência registrada.");
          setTimeout(() => onClose?.(), 800);
        }}
      >
        <EyeOffIcon size={18} /> Não tenho interesse
      </button>

      <button
        type="button"
        className={styles.action}
        onClick={() => setFeedback("Sinalização registrada para revisão.")}
      >
        <FlagIcon size={18} /> Denunciar
      </button>
    </div>
  );
}