//ESTRUTURA BASE DO CARDFEED

import styles from "./bodyCardFeed.module.css";
import CardImage from "./cardImage/CardImage";
import InfoCardFeed from "./infoCard/InfoCardFeed";
import TagsCardFeed from "./tags/TagsCardFeed";
import FooterCardFeed from "./footer/FooterCardFeed";
import PercentCardFeed from "./percent/PercentCardFeed";
import TagData from "../../types/TagData";
import More from "./more/more";

import { EllipsisVerticalIcon } from 'lucide-react'

import { useState } from "react";

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
  
  const [isMoreOpen, setOpenMore] = useState(false);

  
  
  return (
    <div className={styles.fullContent} >
      <div className={styles.bodyCardFeed}>
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
        
        <button className={styles.moreButton} onClick={() => setOpenMore(!isMoreOpen)}>
          <EllipsisVerticalIcon/>
        </button>

        {/* Recebe as tags dos posts */}
        <div className={styles.tagsCardFeed}>
          {(Array.isArray(tags) ? tags : []).map((tag, i) => (
            <TagsCardFeed key={i} tags={tag} />
          ))}
        </div>

        {/* Link para formulario de inscrição */}
        <FooterCardFeed buttomSubmitLink={buttomSubmitLink} />
      </div>
      {isMoreOpen ? (
        <>
          <div className={styles.overlay} onClick={() => setOpenMore(!isMoreOpen)}></div>
          <More isSaved={false} isOpen={true}/>
        </>
        ) : (
          <More isSaved={false} isOpen={false} />
        )}
    </div>
  );
}
