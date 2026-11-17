"use client";

import { useState } from "react";

export default function AuthForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

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
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-3">
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
        required
      />
      <input
        type="password"
        placeholder="Senha"
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
  );
}