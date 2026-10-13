//IMAGEM COVER DO CARD

import Styles from './cardImage.module.css'

{/* Recebe caminho da imagem */}
type CardProps = {
    img?: string | "";
}


export default function CardImage({img}: CardProps) {
    const safeImg: string = img ?? "/assets/placeholder.png";

    return(
        <div className={Styles.cardImage}>
            {/* eslint-disable-next-line @next/next/no-img-element -- migrar para
                next/image exige auditar dimensão/fill do CSS module do card */}
            <img src={safeImg} alt="imagem card" />
        </div>
    )
}