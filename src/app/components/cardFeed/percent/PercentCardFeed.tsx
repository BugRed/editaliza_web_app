//PORCENTAGEM DAS VAGAS OCUPADAS 

import Styles from './PercentCardFeed.module.css'

type PercentCardFeedProps = {
    percent: string;
    cor: string;
}


export default function PercentCardFeed({percent, cor}: PercentCardFeedProps){
    return(
        <div className={Styles.PercentCardFeed}>
            {/* Propriedade cor recebe qualquer forma de declarar cores */}
            <span style={{'--cor-dinamica': cor} as React.CSSProperties} >{percent}% Match</span>        
        </div>
        
    )
}