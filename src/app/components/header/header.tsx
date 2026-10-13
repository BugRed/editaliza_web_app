import styles from './header.module.css'

import { BellIcon } from "lucide-react"

export default function Header(){
    return(
        <div className={styles.header}>
            <p>Editaliza</p>
            
            <button><BellIcon size={24}/></button>
        </div>
    );
}