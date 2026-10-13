//BOTÕES DE INTERAÇÃO COM O CARD:
//CURTIR
//SALVAR
//COMPARTILHAR

import styles from './InteractButtonsCardFeed.module.css'
import Link from "next/link";
import {
    Bookmark,
    Heart,
    Share2,
  } from "lucide-react";
import { useState } from 'react';
  
type InteractButtonsCardFeedProps = {
    liked ?: boolean,
    saved ?: boolean,
}

export default function InteractButtonsCardFeed({liked, saved}: InteractButtonsCardFeedProps){
  const [hasLikeInteracted, setHasLikeInteracted] = useState(false);
  const [like, setLiked] = useState(liked);

  const [hasSaveInteracted, setHasSaveInteracted] = useState(false);
  const [save, setSaved] = useState(saved);

  function handleLike(){
    setHasLikeInteracted(true);
    setLiked(!like);
  }
  
  function handleSave(){
    setHasSaveInteracted(true);
    setSaved(!save);
  }
    return(
        <>
            <div className={styles.InteractButtonsCardFeed}>
              <button onClick={handleLike}>
                  <Heart className={
                    hasLikeInteracted 
                    ? like ? styles.likedHeart : styles.unLikedHeart
                    : like ? styles.likedHeartWithNoAnimation : styles.unlikedHeart
                    } />
              </button>

              <button onClick={handleSave}>
                <Bookmark className={save ? styles.saved: styles.unSaved}/>
              </button>

                
              <Link href={"./"} >
                <Share2 className={styles.Share2}/>
              </Link>
            </div>
        </>
    )
}