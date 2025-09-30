"use client"; 

 

import AuthForm from "@/components/authForm"; 

import { useRouter } from "next/navigation"; 

 

import { FaGoogle } from "react-icons/fa";  

 

export default function GoogleLoginPage() { 

  const router = useRouter(); 

 

  return ( 

    <div className="h-screen w-screen flex items-center justify-center bg-white"> 

      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-lg"> 

        <h1 className="text-3xl font-bold text-black mb-6">Faça login com <button className="text-3xl text-yellow hover:text-blue-400">  

        <FaGoogle />  

      </button></h1> 

        <AuthForm onSuccess={() => router.push("/")} /> 

      </div> 

    </div> 

  ); 

} 