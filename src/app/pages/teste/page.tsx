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

import BodyCardFeed from "@/app/cardFeed/BodyCardFeed";

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
  const [allData, setAllData] = useState<AllData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Determina a URL base corretamente
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL ||
          (process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "");

        const res = await fetch(`${baseUrl}/api/data`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(
            `Erro na busca de dados: ${res.status} ${res.statusText}`
          );
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

  const editals = allData.editals;
  const proposers = allData.proposers;

  return (
    <div className="container mx-auto p-4">
      {editals.map((e) => (
        <div key={e.id} className="border rounded p-4 mb-4">
          <BodyCardFeed 
                  percent="30" 
                  colorPercent="#258611" 
                  coverImage={e.imgCoverUrl} 
                  title={e.title}
                  proposer={e.proposer.name}
                  proposerLink={''}
                  date={e.publishDate}
                  tags={e.listTags}
                  buttomSubmitLink={e.inscriptionLink}
                />
        </div>
      ))}
    </div>
  );
}
