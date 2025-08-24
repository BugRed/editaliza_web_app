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
} from "lucide-react";

// Importa os modelos de dados tipados
import { AllData } from "@/app/types/AllDatas";
import { Edital, IEdital } from "@/app/types/Edital";
import { UserData } from "@/app/types/UserData";
import { TagData } from "@/app/types/TagData";
import { Proposer } from "@/app/types/Proposer";
import { Artist } from "@/app/types/Artist";

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
        console.log('Dados recebidos da API:', rawData); // Debug
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

  // Mapeia os editais, associando o proponente e as tags com base nos IDs
  const editals = allData.editals.map((editalData) => {
    // Busca o proponente usando o id do edital
    const proposer = allData.proposers?.find(
      (p) => p.id === editalData.proposer?.id
    );
    // As tags já estão no objeto editalData. listTags deve ser um array.
    const tags = Array.isArray(editalData.listTags) ? editalData.listTags : [];

    // Cria uma nova instância de Edital com os dados corretos
    const editalInstance = new Edital();
    // Preenche a instância com os dados da API
    Object.assign(editalInstance, editalData);
    // Adiciona as referências corretas
    editalInstance.proposer = proposer as Proposer;
    editalInstance.listTags = tags as TagData[];

    return editalInstance;
  });

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
    ? new Date(edital.publishDate).toLocaleDateString('pt-BR')
    : "Data desconhecida";
  const proposerName = edital.proposer?.name || "Proponente Desconhecido";
  const coverImageUrl = edital.imgCoverUrl || "/assets/placeholder-cover.png";

  return (
    <div className="flex flex-col rounded-2xl shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-200">
      {/* Imagem de capa */}
      <Link href={`./editais/${edital.id}`}>
        <div className="w-full h-40 relative overflow-hidden">
          <SafeImage
            src={coverImageUrl}
            alt={`Capa do edital ${edital.title}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            fallbackSrc="/assets/placeholder-cover.png"
          />
          
          {/* Botão de download do edital */}
          {edital.completeEditalLink && (
            <div className="absolute top-2 right-2">
              <Link href={edital.completeEditalLink} target="_blank" rel="noopener noreferrer">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md transition-colors duration-200">
                  Baixar Edital
                </button>
              </Link>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-xl font-bold mb-1 line-clamp-2">{edital.title}</h2>
        <p className="text-sm text-gray-500 mb-2">Por {proposerName}</p>

        {/* Data de publicação */}
        <div className="text-xs text-gray-600 flex items-center gap-1 relative group cursor-pointer mb-2">
          <span>Publicado em</span>
          <CalendarDays size={14} className="text-gray-400" />
          {/* Tooltip com setinha */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-10">
            {publishedDate}
            <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600"></span>
          </span>
        </div>

        {/* Área das tags */}
        <div className="flex flex-wrap items-start my-2 gap-2">
          {Array.isArray(edital.listTags) &&
            edital.listTags.map((tag) => (
              <button
                key={tag.id}
                className="px-3 py-1 text-sm rounded-full transition-colors duration-200 hover:opacity-80"
                style={{ 
                  backgroundColor: tag.color || '#e5e5e5', 
                  color: "#000000" 
                }}
              >
                {tag.name}
              </button>
            ))}
        </div>

        {/* Botões de interação */}
        <div className="flex flex-row items-center gap-3 text-black mt-auto">
          <button
            className="text-black hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            title="Favoritar"
          >
            <Heart size={20} strokeWidth={1} />
          </button>
          <button
            className="text-black hover:text-green-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            title="Salvar"
          >
            <BookMarked size={20} strokeWidth={1} />
          </button>
          <button
            className="text-black hover:text-blue-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            title="Compartilhar"
          >
            <Share2 size={20} strokeWidth={1} />
          </button>
        </div>

        {/* Botão de aplicação */}
        {edital.inscriptionLink && (
          <div className="flex justify-end mt-4">
            <Link href={edital.inscriptionLink} target="_blank" rel="noopener noreferrer">
              <button className="bg-[#2AB335] hover:bg-[#259E2E] gap-2 px-6 py-2 text-sm text-white font-semibold rounded-full flex items-center shadow-md transition-all duration-200">
                Aplicar <ExternalLink size={16} />
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};