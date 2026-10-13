//IMAGEM COVER DO CARD

import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Styles from './cardImage.module.css'
import Image from "next/image";

{/* Recebe caminho da imagem */}
type CardProps = {
    img?: string | "";
}


export default function CardImage({img}: CardProps) {
    const safeImg: string = img ?? "/assets/placeholder.png";

    return(
        <div className={Styles.cardImage}>
            <img src={safeImg} alt="imagem card" />
        </div>
    )
}