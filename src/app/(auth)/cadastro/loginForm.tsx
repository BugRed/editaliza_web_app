"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sun } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErro("Digite um email válido!");
      return;
    }

    const senhaRegex = /^(?=.*\d).{6,}$/;
    if (!senhaRegex.test(senha)) {
      setErro("A senha deve ter pelo menos 6 caracteres e 1 número.");
      return;
    }

    setErro("");
    router.push("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-(--background) px-4 py-10">
      <div className="w-full max-w-md bg-(--bg-card) border border-(--border-subtle) rounded-xl shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-(--primary) via-(--primary) to-(--accent)" />
        <div className="p-8 flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <Link
              href="/"
              className="w-12 h-12 rounded-xl bg-(--accent) text-(--on-accent) flex items-center justify-center mb-3"
            >
              <Sun size={26} strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <h1 className="text-2xl font-bold text-(--primary-fg)">Editaliza</h1>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-3">
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Senha"
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
              required
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-(--primary) text-white font-semibold hover:bg-(--primary-hover) transition-colors cursor-pointer"
            >
              Entrar
            </button>
            {erro && <p className="text-(--danger) text-sm">{erro}</p>}
          </form>

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