"use client";

import Styles from "./ButtomSubmitCardFeed.module.css";
import { FileText } from "lucide-react";

type ButtomSubmitCardFeedProps = {
  submitLink?: string;
  onOpenSummary?: () => void;
};

export default function ButtomSubmitCardFeed({
  submitLink,
  onOpenSummary,
}: ButtomSubmitCardFeedProps) {
  if (onOpenSummary) {
    return (
      <button
        type="button"
        onClick={onOpenSummary}
        className={Styles.ButtomSubmitCardFeed}
      >
        <span>Inscrever-se</span>
        <FileText size={15} aria-hidden="true" />
      </button>
    );
  }

  const safeHref = submitLink && submitLink.trim() !== "" ? submitLink : "#";
  const isExternal = safeHref.startsWith("http");

  return (
    <a
      href={safeHref}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={Styles.ButtomSubmitCardFeed}
    >
      <span>Inscrever-se</span>
      <FileText size={15} aria-hidden="true" />
    </a>
  );
}