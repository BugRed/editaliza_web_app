import ButtomSubmitCardFeed from "./buttomSubmit/ButtomSubmitCardFeed";
import InteractButtonsCardFeed from "./interactButtons/InteractButtonsCardFeed";
import Styles from "./FooterCardFeed.module.css";

type FooterCardFeedProps = {
  editalId?: number;
  buttomSubmitLink?: string;
  saved?: boolean;
  liked?: boolean;
  title?: string;
  onOpenSummary?: () => void;
};

export default function FooterCardFeed({
  editalId,
  buttomSubmitLink,
  liked,
  saved,
  title,
  onOpenSummary,
}: FooterCardFeedProps) {
  return (
    <div className={Styles.FooterCardFeed}>
      <InteractButtonsCardFeed
        editalId={editalId}
        liked={liked}
        saved={saved}
        title={title}
      />
      <ButtomSubmitCardFeed
        submitLink={buttomSubmitLink}
        onOpenSummary={onOpenSummary}
      />
    </div>
  );
}