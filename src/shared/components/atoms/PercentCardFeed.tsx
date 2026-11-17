// PONTUAÇÃO DE COMPATIBILIDADE ARTIST RANK

import Styles from './PercentCardFeed.module.css'

type PercentCardFeedProps = {
    percent: string;
    cor: string;
    label?: string;
}

export default function PercentCardFeed({percent, cor, label}: PercentCardFeedProps){
    return(
        <div className={Styles.PercentCardFeed} style={{'--cor-dinamica': cor} as React.CSSProperties}>
            <span style={{'--cor-dinamica': cor} as React.CSSProperties}>{label ?? `${percent}% Match`}</span>        
        </div>
    )
}