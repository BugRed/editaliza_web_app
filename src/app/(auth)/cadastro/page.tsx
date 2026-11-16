"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthCard } from "@/shared/components/organisms/AuthCard";
import { SignupForm } from "@/shared/components/organisms/SignupForm";

export default function CadastroPage() {
  const router = useRouter();

  // A gravação da conta chega com o Better Auth (O2). Até lá, nada é enviado nem guardado:
  // o formulário valida e segue para o login, como o cadastro anterior.
  async function handleSignup(): Promise<void> {
    router.push("/login");
  }

  return (
    <AuthCard
      subtitle="Crie sua conta para acompanhar editais que combinam com a sua arte."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <SignupForm onSubmit={handleSignup} />
    </AuthCard>
  );
}
