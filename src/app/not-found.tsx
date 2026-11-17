import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-(--background) px-4 text-center">
      <div className="max-w-md w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl p-8 shadow-xs">
        <p className="text-sm font-semibold text-(--primary-fg) mb-2">404</p>
        <h1 className="text-2xl font-bold text-(--foreground) font-serif mb-2">
          Página não encontrada
        </h1>
        <p className="text-(--text-muted) text-sm mb-6 leading-relaxed">
          O endereço que você acessou não existe ou foi movido.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-(--primary) text-white text-sm font-semibold hover:bg-(--primary-hover) transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}