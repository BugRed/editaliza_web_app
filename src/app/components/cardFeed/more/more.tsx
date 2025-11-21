import React, { HtmlHTMLAttributes, useEffect, useRef, useState } from 'react'
import styles from './more.module.css'

import {
    Share2,
    BookmarkIcon,
    BookmarkCheckIcon,
    EyeOffIcon,
    FlagIcon,
} from 'lucide-react'

type MoreProps = {
    isSaved: boolean,
    isOpen : boolean,
}

export default function More({isSaved, isOpen}: MoreProps){
    const [ isCardSaved, setIsCardSaved ] = isSaved ? useState(true) : useState(false);
    const [ isMoreOpen, setIsMoreOpen] = isOpen ? useState(true) : useState(false);

    const [ isMoreDrag, setIsMoreDrag ] = useState(false);
    const moreDivRef = useRef<HTMLDivElement | null> (null);
    const posicaoAtualRef = useRef({y: 0});

    const onMouseDown = (event: React.MouseEvent<HTMLButtonElement>) =>{
        if(!moreDivRef.current) return 

        setIsMoreDrag(true);

        posicaoAtualRef.current = {y: event.clientY - moreDivRef.current.offsetTop}
    }

    const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if( !isMoreDrag || !moreDivRef.current) return

        moreDivRef.current.style.top = `${event.clientY - posicaoAtualRef.current.y}px`
        
    }
    const onMouseUp = () => {
        setIsMoreDrag(false);
    }

    
    
    return(
        <div
            ref={moreDivRef}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp} 
            className={`${styles.more} ${isMoreOpen ? styles.openMoreAnimation : styles.closeMoreAnimation}`}
        >
    
            <button
                onMouseDown={onMouseDown} 
                className={styles.holdButton}
            >
                <div aria-hidden="true" className={styles.holdMore}></div>
            </button>

            <button className={styles.action}>
                <Share2 /> Compartilhar
            </button>
            
            {isCardSaved ? (
                <button className={styles.action}
                onClick={() => setIsCardSaved(!isCardSaved)}>
                    <BookmarkCheckIcon /> Salvar
                </button>
            ) : (
                <button className={styles.action} 
                onClick={() => setIsCardSaved(!isCardSaved)}>
                    <BookmarkIcon /> Salvar
                </button>
            )}

            <button className={styles.action}><EyeOffIcon /> Não tenho interesse</button>
            
            <button className={styles.action}><FlagIcon /> Denunciar</button>
        </div>
    )
}