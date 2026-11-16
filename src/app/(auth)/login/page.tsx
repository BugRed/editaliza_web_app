"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/app/hooks/useAuth";
import { AuthCard } from "@/shared/components/organisms/AuthCard";
import { LoginForm } from "@/shared/components/organisms/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  return (
    <AuthCard
      subtitle="Acesse editais culturais e oportunidades de fomento com leitura clara e organizada."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-primary hover:underline">
            Cadastre-se
          </Link>
        </>
      }
    >
      <LoginForm onSubmit={login} onSuccess={() => router.push("/")} />
    </AuthCard>
  );
}
