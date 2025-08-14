import Image from "next/image";
import Link from "next/link";

const tags = ["Pintura", "Telas à oleo", "Exposição"];

export default function Home() {
  return (
    <div className="">
      {/* Menu Suspenso */}
      <nav className="flex justify-between">
        <aside>MENU</aside>
        <Link href={"./"}>
          <Image src="./" alt="Logo" />
        </Link>
      </nav>

      {/* Feed */}
      <div className="border-red-600 border h-full w-full flex justify-center">
        {/* Cabeçalho do card do feed */}
        <div className="h-1/2 w-1/2 border-red-600 border rounded-2xl flex flex-col justify-start items-start m-10 bg-fuchsia-600">
          <Link href={"./"} className="h-50 w-84 border border-red-600 solid">
            <Image src="../public/img.png" alt="Imagem do Edital" />
          </Link>
          <div>
            <h1 className="text-2xl">Nome do Edital</h1>
            <p>Usuário que postou</p>
            <p>
              data de postagem <span>icone de calendario</span>
            </p>
          </div>
          <div className="h-1/2 w-1/2 flex flex-row justify-between">
            {tags.map(tags => <button key={tags}>{tags}</button>)}
          </div>
          <button>
            Aplicar <span>icon</span>
          </button>
        </div>
      </div>
    </div>
  );
}
