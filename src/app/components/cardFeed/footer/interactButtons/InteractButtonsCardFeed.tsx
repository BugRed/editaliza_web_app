//BOTÕES DE INTERAÇÃO COM O CARD:
//CURTIR
//SALVAR
//COMPARTILHAR

import Styles from './InteractButtonsCardFeed.module.css'
import Link from "next/link";
import {
    Bookmark,
    Heart,
    Share2,
  } from "lucide-react";
  

export default function InteractButtonsCardFeed(){
    return(
        <>
            <div className={Styles.InteractButtonsCardFeed}>
              <Link href={"./"} >
                  <Heart size={20} className={Styles.Heart} />
              </Link>

              <Link href={"./"}>
                <Bookmark size={20} className={Styles.BookMarked}/>
              </Link>

                
              <Link href={"./"} >
                <Share2 size={20} className={Styles.Share2}/>
              </Link>
            </div>
        </>
    )
}