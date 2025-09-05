"use client" 

 

import { useState } from "react"; 

import { FaGoogle, FaMicrosoft } from "react-icons/fa";  

 

import { useRouter } from "next/navigation"; // import do hook 

 

export default function CadastroPage() { 

  const [email, setEmail] = useState(""); 

  const [senha, setSenha] = useState(""); 

  const [erro, setErro] = useState(""); 

 

  const router = useRouter(); // inicializa o router 

 

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

 

    router.push("/login"); 

  }; 

 

  return ( 

    <div className="h-screen w-screen flex items-center justify-center bg-green-700">  

      {/* Card */} 

      <div className="bg-green-800 flex flex-col items-center p-8 w-full max-w-md rounded-xl shadow-lg">  

         

        {/* Logo */}  

        <div className="flex flex-col items-center mb-6">  

          <h1 style={{fontFamily: 'Barrio, cursive'}} className="text-2xl font-bold text-white mt-3">Bem vindo(a) ao Editaliza!</h1>  

        </div> 

 

        {/* Formulário */} 

        <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-3"> 

          <input 

            type="email" 

            name="email" 

            placeholder="Defina um E-MAIL" 

            value={email} 

            onChange={(e) => setEmail(e.target.value)} 

            className="w-full px-4 py-2 rounded-lg bg-gray-300 text-gray-800 placeholder-gray-600 focus:outline-none" 

            required 

          /> 

          <input 

            type="password" 

            name="password" 

            placeholder="Defina uma SENHA" 

            minLength={8} 

            value={senha} 

            onChange={(e) => setSenha(e.target.value)} 

            className="w-full px-4 py-2 rounded-lg bg-gray-300 text-gray-800 placeholder-gray-600 focus:outline-none" 

            required 

          /> 

          <button type="submit" className="w-full py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">Cadastrar</button> 

          {erro && <p className="text-red-400 text-sm">{erro}</p>} 

        </form> 

 

        {/* Login social */}  

        <p className="mt-4 text-gray-200">Ou utilize:</p>  

        <div className="flex space-x-6 mt-2">  

          <button className="text-3xl text-white hover:text-red-400">  

              <FaGoogle />  

          </button>  

          <button className="text-3xl text-white hover:text-blue-400">  

              <FaMicrosoft />  

          </button>  

        </div>  

      </div>  

    </div> 

  ); 

} 