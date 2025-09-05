//ESTRUTURA DA PARTE MAIS INFERIOR DO CARD. RECEBE:
//BOTÕES DE INTERAÇÃO
//BOTÃO DE INSCRIÇÃO

import ButtomSubmitCardFeed from './buttomSubmit/ButtomSubmitCardFeed'
import InteractButtonsCardFeed from './interactButtons/InteractButtonsCardFeed'
import Styles from './FooterCardFeed.module.css'

type FooterCardFeedProps={
    buttomSubmitLink?: string;
}


export default function FooterCardFeed({buttomSubmitLink}: FooterCardFeedProps){
    return(
        <div className={Styles.FooterCardFeed}>

            <div><InteractButtonsCardFeed /></div>

            <div><ButtomSubmitCardFeed submitLink={buttomSubmitLink}/></div>
            
        </div>
    )
}