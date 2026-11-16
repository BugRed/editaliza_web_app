import Styles from "./InfoCardFeed.module.css";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { SafeDate } from "../../../lib/utils/SafeDate";

type InfoCardFeedProps = {
  title: string;
  proposer: string;
  date?: Date | null;
  linkProposer: string;
};

export default function InfoCardFeed({
  proposer,
  date,
  linkProposer,
}: InfoCardFeedProps) {
  const formattedDate = SafeDate(date);

  return (
    <div className={Styles.infoCardFeed}>
      <div className={Styles.metaRow}>
        {linkProposer ? (
          <Link href={linkProposer} className={Styles.proposerLink}>
            {proposer}
          </Link>
        ) : (
          <span className={Styles.proposer}>{proposer}</span>
        )}

        <span aria-hidden="true" className={Styles.separator}>
          ·
        </span>

        <div className={Styles.date}>
          <span className={Styles.dateTrigger}>
            <CalendarDays size={13} aria-hidden="true" />
            <span>{formattedDate}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
