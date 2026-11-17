'use client';

import { LogoMark, Wordmark } from "@/app/components/brand/Logo";
import AuthForm from "../../components/forms/AuthForm";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-(--background) px-4 py-10">
      <div className="w-full max-w-md bg-(--bg-card) border border-(--border-subtle) rounded-xl shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-(--primary) via-(--primary) to-(--accent)" />

        <div className="p-8 flex flex-col items-center">
          <div className="flex flex-col items-center text-center mb-6">
            <LogoMark size={56} className="mb-3" />
            <h1 aria-label="Editaliza">
              <Wordmark className="text-4xl leading-none" />
            </h1>
            <p className="text-sm text-(--text-muted) mt-1 max-w-xs leading-relaxed">
              Acesse editais culturais e oportunidades de fomento com leitura clara e organizada.
            </p>
          </div>

          <AuthForm onSuccess={() => router.push("/")} />

          <p className="mt-6 text-(--text-muted) text-sm">
            Ainda não tem cadastro?{" "}
            <Link href="/cadastro" className="text-(--primary-fg) font-semibold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}