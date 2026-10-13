'use client';

import AuthForm from "../../components/forms/AuthForm";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Se já estiver logado, redirecionar para home
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-green-700">
      <div className="bg-green-800 flex flex-col items-center p-8 w-full max-w-md rounded-xl shadow-lg">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-md bg-white flex items-center justify-center">
            <Image src="/logoLogin.png" alt="Logo Editaliza" width={96} height={96} />
          </div>
          <h1 style={{ fontFamily: "Barrio, cursive" }} className="text-2xl font-bold text-white mt-3">
            EDITALIZA
          </h1>
        </div>

        {/* Formulário */}
        <AuthForm onSuccess={() => router.push("/")} />

        {/* OAuth Google/Microsoft volta junto com o Better Auth (T1.2) — os
            botões anteriores apontavam para páginas falsas de e-mail/senha */}

        {/* Link de cadastro */}
        <p className="mt-6 text-white text-sm">
          Ainda não tem cadastro?{" "}
          <a href="/cadastro" className="text-yellow-300 font-semibold hover:underline">
            Cadastre-se!
          </a>
        </p>
      </div>
    </div>
  );
}