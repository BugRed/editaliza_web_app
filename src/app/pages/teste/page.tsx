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

import { Edital, IEdital } from "@/app/types/Edital";
import { Proposer } from "@/app/types/Proposer";
import BodyCardFeed from "@/app/cardFeed/BodyCardFeed";
import TagData from "@/app/types/TagData";
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
  fallbackSrc = "/assets/placeholder.png",
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
  const [editals, setEditals] = useState<IEdital[]>([]);
  const [proposers, setProposers] = useState<Proposer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL ||
          (process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "");

        // Busca dados de editais
        const editalsRes = await fetch(`${baseUrl}/api/editals`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!editalsRes.ok) {
          throw new Error(
            `Erro na busca de editais: ${editalsRes.status} ${editalsRes.statusText}`
          );
        }
        const editalsData: IEdital[] = await editalsRes.json();
        setEditals(editalsData);

        // Busca dados de proponentes
        const proposersRes = await fetch(`${baseUrl}/api/proposers`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!proposersRes.ok) {
          throw new Error(
            `Erro na busca de proponentes: ${proposersRes.status} ${proposersRes.statusText}`
          );
        }
        const proposersData: Proposer[] = await proposersRes.json();
        setProposers(proposersData);
        
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

  if (error) {
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
  if (editals.length === 0) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4 text-center">Feed de Editais</h1>
        <p className="text-gray-500 text-center">
          Nenhum edital encontrado. Tente importar os dados novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {editals.map((edital) => {
        // Encontra o proponente correspondente
        const proposer = proposers.find(p => p.id === Number(edital.proposer));
        
        // Converte a string JSON de tags para um array de objetos tipado

        // Renderiza o BodyCardFeed apenas se o proponente for encontrado
        if (proposer) {
          return (
            <div key={edital.id} className="w-full max-w-2xl mb-8">
              <BodyCardFeed 
                percent="30" 
                colorPercent="#258611" 
                coverImage={edital.imgCoverUrl || '/assets/placeholder.png'} 
                title={edital.title}
                proposer={proposer.name}
                proposerLink={''}
                date={edital.publishDate}
                tags={edital.listTags}
                buttomSubmitLink={edital.inscriptionLink}
              />
            </div>
          );
        }
        return null; // Não renderiza se o proponente não for encontrado
      })}
    </div>
  );
}
