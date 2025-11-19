import styles from './footer.module.css'

import { 
    HouseIcon,
    SettingsIcon,
    BookmarkIcon
 } from "lucide-react"

type FooterProps = {
    notReadNotification ?: boolean
}

export default function Footer(){
    return(
        <div className={styles.footer}>
            
            <button><HouseIcon size={24}/></button>
            <button><BookmarkIcon size={24}/></button>
            <button><SettingsIcon size={24}/></button>
            <button><HouseIcon size={24}/></button>
        
        </div>
    );
}