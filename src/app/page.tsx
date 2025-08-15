import Image from "next/image";
import Link from "next/link";
import cardIcon from "./assets/feed-card.svg";
import {
  ArrowRight,
  BookMarked,
  Calendar,
  CalendarDays,
  ExternalLink,
  Heart,
  Mail,
  Share2,
  User,
} from "lucide-react";

const tags = ["Pintura", "Telas à oleo", "Exposição"];

export default function Home() {
  return (
    <div className="">
      {/* Menu Suspenso */}
      <nav className="flex justify-between">
        <aside>MENU</aside>
        <Link href={"./perfil"}>
          <Image
            width={50}
            height={50}
            src="./assets/feed-card.svg"
            alt="Logo"
          />
        </Link>
      </nav>

      {/* Feed */}
      <div className="border-red-600 border h-full w-full flex justify-center">
        {/* Cabeçalho do card do feed */}
        <div className="h-1/2 flex flex-col justify-start items-start m-10 rounded-t-2xl bg-[#A682B4] bg-opacity-50">
          <Link href={"./editais"}>
            <Image
              width={370}
              height={157}
              src={cardIcon}
              alt="Imagem do Edital"
              className="rounded-t-2xl"
            />
          </Link>

          {/* Titulo do card do feed */}
          <div className="flex flex-col items-start p-4">
            <div className="">
              <h1 className="text-2xl">Nome do Edital</h1>
              <p className="text-xs">Usuário que postou</p>

              {/*Calendario já é um componente aqui estruturadp */}
              <p className="text-xs flex gap-2 relative group cursor-pointer">
                data de postagem
                <CalendarDays size={16} />
                {/* Tooltip com setinha */}
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
                  21/04/2025
                  {/* Setinha */}
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600"></span>
                </span>
              </p>
            </div>

            {/* Área das tags */}
            <div className="flex flex-row items-start my-2 gap-3">
              {tags.map((tags) => (
                <button
                  className="bg-[#F6E373] bg-opacity-50 px-3 text-sm text-[#000000] border solid"
                  key={tags}
                >
                  {tags}
                </button>
              ))}
            </div>

            {/* Botões de curtir e compartilhar*/}
            <div className="flex flex-row items-center gap-2 text-black">
              <Link
                href={"./"}
                className="text-black hover:text-red-500 transition-colors duration-200 group"
              >
                <Heart
                  size={16}
                  strokeWidth={0.5}
                  className="group-hover:fill-current"
                />
              </Link>

              <Link href={"./"} className="text-black hover:text-green-500 hover:opacity-50 transition-colors duration-200 group">
                <BookMarked size={16} strokeWidth={0.5}/>
              </Link>

              
              <Link href={"./"} className="text-black hover:text-green-500 hover:opacity-50 transition-colors duration-200 group">
                <Share2 size={16} strokeWidth={0.5} className="group-hover:fill-current"/>
              </Link>
            </div>

            {/* Botão que deve levar até os editais */}
            <div className="flex flex-col justify-end mx-12 items-end w-full">
              <Link href={"./editais"}>
                <button className="bg-[#2AB335] bg-opacity-50 gap-2 px-6 py-1 m-1 text-sm text-[#000000] border solid rounded-md flex">
                  Aplicar <ExternalLink />
                </button>
              </Link>
            </div>
          </div>

          {/* Rodapé do card do feed */}
        </div>
      </div>
    </div>
  );
}
