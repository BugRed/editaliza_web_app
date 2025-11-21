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
  Home,
  Bookmark,
  User,
  Settings,
  HelpCircle,
  UserCircle2,
  Menu
} from "lucide-react";

import { Edital, IEdital } from "@/app/types/Edital";
import { Proposer } from "@/app/types/Proposer";
import BodyCardFeed from "@/app/components/cardFeed/BodyCardFeed";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
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

  // Renderização do estado de loading
  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-20 pb-20 min-h-screen flex flex-col items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <h1 className="text-3xl font-bold mb-4 text-center text-white">Feed de Editais</h1>
          <p className="text-white/70 text-center">Carregando dados...</p>
        </div>
        <Footer />
      </>
    );
  }

  // Renderização do estado de erro
  if (error) {
    return (
      <>
        <Header />
        <div className="pt-20 pb-20 min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold mb-4 text-center text-white">Feed de Editais</h1>
          <p className="text-red-300 text-center">
            {error || "Erro ao carregar dados. Tente novamente mais tarde."}
          </p>
        </div>
        <Footer />
      </>
    );
  }

  // Renderização quando não há editais
  if (editals.length === 0) {
    return (
      <>
        <Header />
        <div className="pt-20 pb-20 min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold mb-4 text-center text-white">Feed de Editais</h1>
          <p className="text-white/70 text-center">
            Nenhum edital encontrado. Tente importar os dados novamente.
          </p>
        </div>
        <Footer />
      </>
    );
  }

  // Renderização principal com os editais
  return (
    <>
      <Header />
      
      {/* Conteúdo principal - com padding para não sobrepor header e footer */}
      <main className="pt-20 pb-20 min-h-screen">
        <div className="flex flex-col items-center justify-center p-4 w-screen">
          {editals.map((edital) => {
            // Encontra o proponente correspondente
            const proposer = proposers.find(p => p.id === Number(edital.proposer));
            
            
            // Renderiza o BodyCardFeed apenas se o proponente for encontrado
            if (proposer) {
              return (
                <div key={edital.id} className="my-10">
                  <BodyCardFeed 
                    percent="30" 
                    colorPercent="#F2a900" 
                    coverImage={edital.imgCoverUrl || '/assets/placeholder.png'} 
                    title={edital.title}
                    proposer={proposer.name}
                    proposerLink={''}
                    date={edital.publishDate}
                    tags={typeof(edital.listTags) == "string" ? JSON.parse(edital.listTags) : edital.listTags}
                    buttomSubmitLink={edital.inscriptionLink}
                  />
                </div>
              );
            }
            return null; // Não renderiza se o proponente não for encontrado
          })}
        </div>
      </main>

      <Footer />
    </>
  );
}