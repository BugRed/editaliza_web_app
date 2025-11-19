import styles from './more.module.css'

import {
    Share2,
    BookmarkIcon,
    EyeOffIcon,
    FlagIcon,
} from 'lucide-react'


export default function More(){
    return(
        <div className={styles.more}>
    
            <button className={styles.holdButton}>
                <div aria-hidden="true" className={styles.holdMore}></div>
            </button>
            <button className={styles.action}><Share2 />Compartilhar</button>
            <button className={styles.action}><BookmarkIcon />Salvar</button>
            <button className={styles.action}><EyeOffIcon />Não tenho interesse</button>
            <button className={styles.action}><FlagIcon />Denunciar</button>
        </div>
    )
}