import Link from "next/link";
import { LogoMark } from "@/shared/components/atoms/Logo";
import SignupForm from "@/shared/components/organisms/SignupForm";

export default function CadastroPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-(--background) px-4 py-10">
      <div className="w-full max-w-xl bg-(--bg-card) border border-(--border-subtle) rounded-xl shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-(--primary) via-(--primary) to-(--accent)" />

        <div className="p-6 sm:p-8 flex flex-col">
          <div className="flex flex-col items-center text-center mb-6">
            <LogoMark size={56} className="mb-3" />
            <h1 className="text-2xl font-bold tracking-tight text-(--primary-fg)">Criar conta no Editaliza</h1>
            <p className="text-sm text-(--text-muted) mt-1">
              Escolha o tipo de perfil para acessar oportunidades ou divulgar editais.
            </p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-(--text-muted) text-sm">
            Já possui uma conta?{" "}
            <Link href="/login" className="text-(--primary-fg) font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
