//ESTRUTURA BASE DO CARDFEED

import Styles from "./bodyCardFeed.module.css";
import CardImage from "./cardImage/CardImage";
import InfoCardFeed from "./infoCard/InfoCardFeed";
import TagsCardFeed from "./tags/TagsCardFeed";
import FooterCardFeed from "./footer/FooterCardFeed";
import PercentCardFeed from "./percent/PercentCardFeed";
import TagData from "../types/TagData";

type cardFeedProps = {
  percent: string;
  colorPercent: string;
  coverImage?: string | "";
  title: string;
  proposer: string;
  date?: Date | null;
  tags: TagData[];
  buttomSubmitLink?: string;
  proposerLink: string;
};

{
  /* Recebe todos os componentes do card */
}
export default function BodyCardFeed({
  percent,
  colorPercent,
  coverImage,
  title,
  proposer,
  date,
  tags,
  buttomSubmitLink,
  proposerLink,
}: cardFeedProps) {
  return (
    <div className={Styles.bodyCardFeed}>
      {/* percent: string (valor numerico 0 ~ 100)  -  cor: string (#258611(verde 0 ~ 45) - #864F11(amarelo 46 ~ 75) - #B71C1C(vermelho 76 ~ 100))*/}
      <PercentCardFeed percent={percent} cor={colorPercent} />

      {/* img: any */}
      <CardImage img={coverImage} />

      {/* title: string  -  proposer: string  -  date: string ('DD-MM-AAAA')*/}
      <InfoCardFeed
        title={title}
        proposer={proposer}
        date={date}
        linkProposer={proposerLink}
      />

      {/* Recebe as tags dos posts */}
      <div className={Styles.tagsCardFeed}>
        {(Array.isArray(tags) ? tags : []).map((tag, i) => (
          <TagsCardFeed key={i} tags={tag} />
        ))}
      </div>

      {/* Link para formulario de inscrição */}
      <FooterCardFeed buttomSubmitLink={buttomSubmitLink} />
    </div>
  );
}
