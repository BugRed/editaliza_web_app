"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import Styles from "./cardImage.module.css";

type CardProps = {
  img?: string | "";
  title?: string;
};

export default function CardImage({ img, title }: CardProps) {
  const [hasError, setHasError] = useState(!img || img.includes("exemplo.com") || img.includes("placeholder"));

  if (hasError || !img) {
    return (
      <div className={Styles.fallback} aria-label={title || "Capa do edital"}>
        <div className={Styles.fallbackInner}>
          <span className={Styles.fallbackIcon}>
            <BookOpen size={24} strokeWidth={1.8} />
          </span>
          {title && <span className={Styles.fallbackLabel}>{title}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={Styles.cardImage}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img}
        alt={title || "Capa do edital"}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    </div>
  );
}