import DateBox from './dateBox/DateBox';
import Styles from './InfoCardFeed.module.css'
import { CalendarDays } from "lucide-react";
import Link from 'next/link';
import { SafeDate } from '../../utils/SafeDate';

type InfoCardFeedProps = {
    title: string;
    proposer: string;
    date?: Date | null;
    linkProposer: string;
}

export default function InfoCardFeed({title, proposer, date, linkProposer}: InfoCardFeedProps) {
    return (
        <div className={Styles.infoCardFeed}>
            <h1>{title}</h1>
            
            <Link href={linkProposer}>
                <p>{proposer}</p>
            </Link>

            <div className={Styles.date}>
                Data de postagem <CalendarDays size={14}/>
                <span className={Styles.opacityController}>
                  <DateBox date={SafeDate(date)} /> 
                  {/* Agora sempre chega string legível */}
                </span>
            </div>
        </div>
    )
}
