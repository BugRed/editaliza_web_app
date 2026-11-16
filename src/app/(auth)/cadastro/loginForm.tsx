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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFB] px-4 py-10">
      <div className="w-full max-w-md bg-white border border-[#DCE6E8] rounded-xl shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0E7C86] via-[#0E7C86] to-[#FFB800]" />
        <div className="p-8 flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <Link
              href="/"
              className="w-12 h-12 rounded-xl bg-[#FFB800] text-[#102A30] flex items-center justify-center mb-3"
            >
              <Sun size={26} strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <h1 className="text-2xl font-bold text-[#0E7C86]">Editaliza</h1>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-3">
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Senha"
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#F8FAFB] border border-[#DCE6E8] text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
              required
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#0E7C86] text-white font-semibold hover:bg-[#0B656D] transition-colors cursor-pointer"
            >
              Entrar
            </button>
            {erro && <p className="text-red-600 text-sm">{erro}</p>}
          </form>

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