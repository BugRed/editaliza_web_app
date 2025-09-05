"use client"; 

 

import AuthForm from "@/components/authForm"; 

import { useRouter } from "next/navigation"; 

import { FaGoogle, FaMicrosoft } from "react-icons/fa"; 

import Image from "next/image"; 

 

export default function LoginPage() { 

  const router = useRouter(); 

 

  return ( 

    <div className="h-screen w-screen flex items-center justify-center bg-green-700"> 

      <div className="bg-green-800 flex flex-col items-center p-8 w-full max-w-md rounded-xl shadow-lg"> 

         

        {/* Logo */} 

        <div className="flex flex-col items-center mb-6"> 

          <div className="w-24 h-24 rounded-full overflow-hidden shadow-md bg-white flex items-center justify-center"> 

            <Image src="/logoLogin.png" alt="Logo Editaliza" width={96} height={96} /> 

          </div> 

          <h1 style={{ fontFamily: "Barrio, cursive" }} className="text-2xl font-bold text-white mt-3">EDITALIZA</h1> 

        </div> 

 

        {/* Formulário */} 

        <AuthForm onSuccess={() => router.push("/")} /> 

 

        {/* Login social */} 

        <p className="mt-4 text-gray-200">Ou utilize:</p> 

        <div className="flex space-x-6 mt-2"> 

          <button onClick={() => router.push("/login/google")} className="text-3xl text-white hover:text-red-400"> 

            <FaGoogle /> 

          </button> 

          <button onClick={() => router.push("/login/microsoft")} className="text-3xl text-white hover:text-blue-400"> 

            <FaMicrosoft /> 

          </button> 

        </div> 

 

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