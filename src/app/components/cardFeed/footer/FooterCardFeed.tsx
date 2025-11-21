//ESTRUTURA DA PARTE MAIS INFERIOR DO CARD. RECEBE:
//BOTÕES DE INTERAÇÃO
//BOTÃO DE INSCRIÇÃO

import ButtomSubmitCardFeed from './buttomSubmit/ButtomSubmitCardFeed'
import InteractButtonsCardFeed from './interactButtons/InteractButtonsCardFeed'
import Styles from './FooterCardFeed.module.css'

type FooterCardFeedProps={
    buttomSubmitLink?: string;
    saved ?: boolean;
    liked ?: boolean;
}


export default function FooterCardFeed({buttomSubmitLink, liked, saved}: FooterCardFeedProps){
    return(
        <div className={Styles.FooterCardFeed}>

            <InteractButtonsCardFeed liked={liked} saved={saved}/>

            <ButtomSubmitCardFeed submitLink={buttomSubmitLink}/>
            
        </div>
    )
}