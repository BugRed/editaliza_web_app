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

// Componente Header fixo com logo e menu dropdown
const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)] border-b border-white/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo à esquerda */}
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="ml-2 text-white font-semibold text-lg">Editais</span>
        </div>

        {/* Menu dropdown à direita */}
        <div className="relative">
          <button
            className="flex items-center space-x-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <Menu size={20} />
            <span>Menu</span>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <Link
                href="/conta"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User size={16} className="mr-3" />
                Conta
              </Link>
              <Link
                href="/configuracoes"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings size={16} className="mr-3" />
                Configurações
              </Link>
              <Link
                href="/suporte"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <HelpCircle size={16} className="mr-3" />
                Suporte
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Componente Footer fixo com ícones de navegação
const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--background)] border-t border-white/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-center items-center space-x-8">
          {/* Ícone Home */}
          <button className="flex flex-col items-center space-y-1 text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
            <Home size={20} />
            <span className="text-xs">Home</span>
          </button>

          {/* Ícone Salvar */}
          <button className="flex flex-col items-center space-y-1 text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
            <Bookmark size={20} />
            <span className="text-xs">Salvar</span>
          </button>

          {/* Ícone Compartilhar */}
          <button className="flex flex-col items-center space-y-1 text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
            <Share2 size={20} />
            <span className="text-xs">Compartilhar</span>
          </button>

          {/* Ícone do Perfil - imagem redonda */}
          <button className="flex flex-col items-center space-y-1 text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <UserCircle2 size={16} />
            </div>
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </div>
    </footer>
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
        <div className="flex flex-col items-center justify-center p-4">
          {editals.map((edital) => {
            // Encontra o proponente correspondente
            const proposer = proposers.find(p => p.id === Number(edital.proposer));
            
            // Renderiza o BodyCardFeed apenas se o proponente for encontrado
            if (proposer) {
              return (
                <div key={edital.id} className="my-10">
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
      </main>

      <Footer />
    </>
  );
}