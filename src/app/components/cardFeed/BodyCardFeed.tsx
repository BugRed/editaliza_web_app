"use client";

import { useState } from "react";
import { AlertCircle, EllipsisVerticalIcon, ShieldAlert } from "lucide-react";
import styles from "./bodyCardFeed.module.css";
import CardImage from "./cardImage/CardImage";
import InfoCardFeed from "./infoCard/InfoCardFeed";
import TagsCardFeed from "./tags/TagsCardFeed";
import FooterCardFeed from "./footer/FooterCardFeed";
import PercentCardFeed from "./percent/PercentCardFeed";
import TagData from "../../types/TagData";
import More from "./more/more";
import { ArtistRankResult } from "@/shared/lib/artistrank";

type cardFeedProps = {
  editalId?: number;
  percent: string;
  colorPercent: string;
  coverImage?: string | "";
  title: string;
  description?: string;
  proposer: string;
  date?: Date | null;
  tags: TagData[];
  buttomSubmitLink?: string;
  proposerLink: string;
  rank?: ArtistRankResult;
  onOpenSummary?: () => void;
};

export default function BodyCardFeed({
  editalId,
  percent,
  colorPercent,
  coverImage,
  title,
  description,
  proposer,
  date,
  tags,
  buttomSubmitLink,
  proposerLink,
  rank,
  onOpenSummary,
}: cardFeedProps) {
  const [isMoreOpen, setOpenMore] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const safeTags = Array.isArray(tags) ? tags : [];
  const initials = proposer
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const badgeLabel = rank
    ? rank.bloqueado
      ? "Inelegível"
      : `${rank.scoreFinal.toFixed(1)}% Match`
    : percent === "Aberto"
    ? "Edital aberto"
    : undefined;

  return (
    <article className={styles.fullContent}>
      <div className={styles.bodyCardFeed}>
        {/* Post Header (X / Instagram style) */}
        <div className={styles.postHeader}>
          <div className={styles.proposerCluster}>
            <div className={styles.proposerAvatar} aria-hidden="true">
              {initials}
            </div>
            <InfoCardFeed
              title={title}
              proposer={proposer}
              date={date}
              linkProposer={proposerLink}
            />
          </div>

          <button
            type="button"
            aria-label="Mais opções"
            className={styles.moreButton}
            onClick={() => setOpenMore(!isMoreOpen)}
          >
            <EllipsisVerticalIcon size={19} />
          </button>
        </div>

        {/* Post Media (Instagram-like 16:9 image) */}
        <div className={styles.mediaWrapper}>
          <CardImage img={coverImage} title={title} />
          <PercentCardFeed
            percent={percent}
            cor={colorPercent}
            label={badgeLabel}
          />
        </div>

        {/* Post Body & Actions */}
        <div className={styles.contentWrapper}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={styles.postTitle}>{title}</h2>
            {rank && (
              <span className="text-xs font-medium text-[#4A656B] tabular-nums">
                {rank.nivelAderencia} · Confiança {rank.confiancaC.toFixed(1)}
              </span>
            )}
          </div>

          {rank?.bloqueado && rank.motivoBloqueio && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
              <ShieldAlert size={15} className="mt-0.5 shrink-0" />
              <span>{rank.motivoBloqueio}</span>
            </div>
          )}

          {!rank?.bloqueado && rank?.tetoAplicado && rank.motivoTeto && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-[#FFF8E1] px-3 py-2 text-xs font-medium text-[#7A5400]">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{rank.motivoTeto}</span>
            </div>
          )}

          {description && (
            <div className={styles.descriptionBlock}>
              <p className={expanded ? styles.descriptionFull : styles.descriptionClamp}>
                {description}
              </p>
              {description.length > 140 && (
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  className={styles.readMoreBtn}
                >
                  {expanded ? "Ler menos" : "Continuar lendo"}
                </button>
              )}
            </div>
          )}

          {safeTags.length > 0 && (
            <div className={styles.tagsCardFeed} aria-label="Categorias">
              {safeTags.map((tag, i) => (
                <TagsCardFeed key={tag.id ?? i} tags={tag} index={i} />
              ))}
            </div>
          )}

          <FooterCardFeed
            editalId={editalId}
            buttomSubmitLink={buttomSubmitLink}
            title={title}
            onOpenSummary={onOpenSummary}
          />
        </div>
      </div>

      {isMoreOpen && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setOpenMore(false)}
          />
          <More
            isSaved={false}
            isOpen={true}
            onClose={() => setOpenMore(false)}
            title={title}
          />
        </>
      )}
    </article>
  );
}
