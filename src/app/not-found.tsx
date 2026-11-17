import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFB] px-4 text-center">
      <div className="max-w-md w-full bg-white border border-[#DCE6E8] rounded-xl p-8 shadow-xs">
        <p className="text-sm font-semibold text-[#0E7C86] mb-2">404</p>
        <h1 className="text-2xl font-bold text-[#102A30] font-serif mb-2">
          Página não encontrada
        </h1>
        <p className="text-[#4A656B] text-sm mb-6 leading-relaxed">
          O endereço que você acessou não existe ou foi movido.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#0E7C86] text-white text-sm font-semibold hover:bg-[#0B656D] transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}