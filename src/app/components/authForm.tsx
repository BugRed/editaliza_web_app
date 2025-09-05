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

    console.log("Login aceito:", { email, senha }); 

 

    if (onSuccess) onSuccess(); 

  }; 

 

  return ( 

    <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-3"> 

      <input 

        type="email" 

        placeholder="Login" 

        value={email} 

        onChange={(e) => setEmail(e.target.value)} 

        className="w-full px-4 py-2 rounded-lg bg-gray-300 text-gray-800 placeholder-gray-600 focus:outline-none" 

        required 

      /> 

      <input 

        type="password" 

        placeholder="Senha" 

        value={senha} 

        onChange={(e) => setSenha(e.target.value)} 

        className="w-full px-4 py-2 rounded-lg bg-gray-300 text-gray-800 placeholder-gray-600 focus:outline-none" 

        required 

      /> 

      <button 

        type="submit" 

        className="w-full py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700" 

      > 

        Entrar 

      </button> 

      {erro && <p className="text-red-400 text-sm">{erro}</p>} 

    </form> 

  ); 

} 