//ARRAY DE TAGS ESCOLHIDA PELO PROPOSER PARA O CARD

import TagData from '@/app/types/TagData';

type tagsProps ={
    tags: TagData;
}
 
// Simulação do que é esperado receber na props "Tags: string[]":
// ["Pintura", "Telas à oleo", "Exposição"];

export default function TagsCardFeed({tags}: tagsProps){
    return(
        <p>{tags.name}</p>
    )
}