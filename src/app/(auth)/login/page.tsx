'use client';

import AuthForm from "../../components/forms/AuthForm";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Sun } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFB] px-4 py-10">
      <div className="w-full max-w-md bg-white border border-[#DCE6E8] rounded-xl shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0E7C86] via-[#0E7C86] to-[#FFB800]" />

        <div className="p-8 flex flex-col items-center">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#FFB800] text-[#102A30] flex items-center justify-center mb-3 shadow-xs">
              <Sun size={26} strokeWidth={2.2} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0E7C86]">
              Editaliza
            </h1>
            <p className="text-sm text-[#4A656B] mt-1 max-w-xs leading-relaxed">
              Acesse editais culturais e oportunidades de fomento com leitura clara e organizada.
            </p>
          </div>

          <AuthForm onSuccess={() => router.push("/")} />

          <p className="mt-6 text-[#4A656B] text-sm">
            Ainda não tem cadastro?{" "}
            <Link href="/cadastro" className="text-[#0E7C86] font-semibold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}