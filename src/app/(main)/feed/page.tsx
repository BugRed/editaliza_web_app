// src/app/feed/page.tsx
// Este é um Server Component, que busca os dados no servidor antes da renderização.

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  BookMarked,
  CalendarDays,
  ExternalLink,
  Heart,
  Share2,
  Mail,
  Tags,
} from "lucide-react";

// Importa os modelos de dados tipados
import { AllData } from "@/app/types/AllDatas";
import { Edital, IEdital } from "@/app/types/Edital";
import { UserData } from "@/app/types/UserData";
import { TagData } from "@/app/types/TagData";
import { Proposer } from "@/app/types/Proposer";
import { Artist } from "@/app/types/Artist";
import { log } from "console";

import BodyCardFeed from '@/app/components/cardFeed/BodyCardFeed';

// Componente de imagem com fallback
const SafeImage = ({ 
  src, 
  alt, 
  className, 
  width, 
  height, 
  fill, 
  sizes, 
  priority,
  fallbackSrc = "/assets/placeholder.png"
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  fallbackSrc?: string;
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => {
        console.log(`Erro ao carregar imagem: ${imgSrc}`);
        setImgSrc(fallbackSrc);
      }}
    />
  );
};

// Componente principal da página Feed
export default function FeedPage() {
  const [allData, setAllData] = useState<AllData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Determina a URL base corretamente
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '');
        
        const res = await fetch(`${baseUrl}/api/data`, {
          cache: "no-store",
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error(`Erro na busca de dados: ${res.status} ${res.statusText}`);
        }
        
        // Recebe os dados brutos da API
        const rawData = await res.json();
        // console.log('Dados recebidos da API:', rawData); // Debug
        setAllData(rawData as AllData);
      } catch (err: any) {
        setError(err.message);
        console.error("Falha ao buscar dados da API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <h1 className="text-3xl font-bold mb-4 text-center">Feed de Editais</h1>
        <p className="text-gray-500 text-center">Carregando dados...</p>
      </div>
    );
  }

  if (error || !allData) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4 text-center">Feed de Editais</h1>
        <p className="text-red-500 text-center">
          {error || "Erro ao carregar dados. Tente novamente mais tarde."}
        </p>
      </div>
    );
  }

  // Verifica se existem editais
  if (!allData.editals || allData.editals.length === 0) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4 text-center">Feed de Editais</h1>
        <p className="text-gray-500 text-center">
          Nenhum edital encontrado. Tente importar os dados novamente.
        </p>
      </div>
    );
  }
  


  // // Mapeia os editais, associando o proponente e as tags com base nos IDs
  // const editals = allData.editals.map((editalData) => {
  //   // Busca o proponente usando o id do edital   

  //   const proposer = allData.proposers?.find(
  //     (p) => p.id === editalData.proposer?.id 
      
  //   );
    
  //   // As tags já estão no objeto editalData. listTags deve ser um array.
  //   const tags = Array.isArray(editalData.listTags) ? editalData.listTags : [];

    
  //   // Cria uma nova instância de Edital com os dados corretos
  //   const editalInstance = new Edital();
  //   // Preenche a instância com os dados da API
  //   Object.assign(editalInstance, editalData);
  //   // Adiciona as referências corretas
  //   editalInstance.proposer = proposer as Proposer;
  //   editalInstance.listTags = tags as TagData[];

  //   return editalInstance;
  // });

  const editals = allData.editals
  const proposers = allData.proposers



  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Menu Superior - Estático, conforme o layout original */}
      <nav className="flex justify-between items-center mb-10">
        <aside className="text-xl font-bold">MENU</aside>
        <Link href={"./perfil"}>
          <SafeImage
            width={50}
            height={50}
            src="/assets/feed-card.svg"
            alt="Logo do Perfil"
            className="rounded-full"
            priority
            fallbackSrc="/assets/placeholder-profile.png"
          />
        </Link>
      </nav>

      {/* Debug info - remover em produção */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p>Total de editais: {editals.length}</p>
          <p>Dados carregados: {allData ? 'Sim' : 'Não'}</p>
        </div>
      )}

      {/* Feed - Layout de grid responsivo para os cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {editals.map((edital) => (
          <FeedCard key={edital.id} edital={edital} />
        ))}
      </div>
    </div>
  );
}

// Componente separado para renderizar um único card, com base nos seus modelos
const FeedCard = ({ edital }: { edital: Edital }) => {
  const publishedDate = edital.publishDate
    ? new Date(edital.publishDate)
    : null;

  const proposerName = edital.proposer?.name || "Proponente Desconhecido";
  const coverImageUrl = edital.imgCoverUrl || "/assets/placeholder-cover.png";
  const inscriptionLink = edital.inscriptionLink || "#"

  const tagsList = edital.listTags;
  
  

  return (
    <div>
      <BodyCardFeed 
        percent="30" 
        colorPercent="#258611" 
        coverImage={coverImageUrl} 
        title={edital.title}
        proposer={proposerName}
        proposerLink={''}
        date={publishedDate}
        tags={tagsList}
        buttomSubmitLink={inscriptionLink}
      />
    </div>

  );
};