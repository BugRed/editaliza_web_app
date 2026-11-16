"use client";

import styles from "./InteractButtonsCardFeed.module.css";
import { Bookmark, Check, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { useSocialStore } from "@/app/hooks/useSocialStore";

type InteractButtonsCardFeedProps = {
  editalId?: number;
  liked?: boolean;
  saved?: boolean;
  title?: string;
};

export default function InteractButtonsCardFeed({
  editalId,
  liked,
  saved,
  title,
}: InteractButtonsCardFeedProps) {
  const { isEditalSaved, toggleSaveEdital, isEditalLiked, toggleLikeEdital } =
    useSocialStore();
  const [hasLikeInteracted, setHasLikeInteracted] = useState(false);
  const [localLike, setLocalLike] = useState(Boolean(liked));
  const [localSave, setLocalSave] = useState(Boolean(saved));
  const [copied, setCopied] = useState(false);

  const like = typeof editalId === "number" ? isEditalLiked(editalId) : localLike;
  const save = typeof editalId === "number" ? isEditalSaved(editalId) : localSave;

  function handleLike() {
    setHasLikeInteracted(true);
    if (typeof editalId === "number") {
      toggleLikeEdital(editalId);
    } else {
      setLocalLike(!localLike);
    }
  }

  function handleSave() {
    if (typeof editalId === "number") {
      toggleSaveEdital(editalId);
    } else {
      setLocalSave(!localSave);
    }
  }

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || "Editaliza",
          url: shareUrl,
        });
      } else if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // Usuário cancelou
    }
  }

  return (
    <div className={styles.InteractButtonsCardFeed}>
      <button
        type="button"
        onClick={handleLike}
        aria-label={like ? "Remover curtida" : "Curtir edital"}
        aria-pressed={like}
        className={styles.iconBtn}
      >
        <Heart
          size={19}
          className={
            hasLikeInteracted
              ? like
                ? styles.likedHeart
                : styles.unLikedHeart
              : like
              ? styles.likedHeartWithNoAnimation
              : styles.unLikedHeartWithNoAnimation
          }
        />
      </button>

      <button
        type="button"
        onClick={handleSave}
        aria-label={save ? "Remover dos salvos" : "Salvar edital"}
        aria-pressed={save}
        className={styles.iconBtn}
      >
        <Bookmark size={19} className={save ? styles.saved : styles.unSaved} />
      </button>

      <button
        type="button"
        onClick={handleShare}
        aria-label="Compartilhar edital"
        className={styles.iconBtn}
      >
        {copied ? (
          <span className={styles.copiedLabel}>
            <Check size={16} />
            <span>Copiado</span>
          </span>
        ) : (
          <Share2 size={19} className={styles.Share2} />
        )}
      </button>
    </div>
  );
}