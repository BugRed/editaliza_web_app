import Styles from './ButtomSubmitCardFeed.module.css'
import { ExternalLink } from "lucide-react";
import Link from 'next/link';

type ButtomSubmitCardFeedProps={
    submitLink?: string;
}

export default function ButtomSubmitCardFeed({submitLink}: ButtomSubmitCardFeedProps){
    const safeImg: string = submitLink ?? "/assets/placeholder.png";
    return(
        <>
            {/* href={edital.inscriptionLink} */}
            <Link href={safeImg}>
                <button className={Styles.ButtomSubmitCardFeed}>submit <ExternalLink size={16}/></button>
            </Link>
        </>
    )
}