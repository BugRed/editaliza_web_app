'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login: authenticate, loginTester } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await authenticate(login, password);

    if (success) {
      router.push('/pages/feed');
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 mb-6 relative">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center border-4 border-purple-700">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center relative">
                <span className="text-white font-bold text-2xl">E</span>
                <div className="absolute -top-2 -right-1 w-6 h-4 bg-green-500 rounded-sm transform rotate-12"></div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-purple-900 font-serif">Editaliza</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Login Input */}
          <div className="relative">
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-5 py-3 bg-purple-200 bg-opacity-50 rounded-full text-gray-700 placeholder-gray-600 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Login"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-purple-200 bg-opacity-50 rounded-full text-gray-700 placeholder-gray-600 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Senha"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 w-full bg-purple-400 bg-opacity-80 rounded-full text-black font-bold text-lg border border-purple-600 hover:bg-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            {/* Entrar como Tester */}
            <button
              type="button"
              onClick={async () => {
                // loginTester sets test flag and user
                await loginTester();
                router.push('/pages/feed');
              }}
              className="mt-4 px-8 py-3 w-full bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-colors"
            >
              ENTRAR COMO TESTER
            </button>
          </div>
        </form>

        {/* Alternative Login Options */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 font-bold text-lg mb-4">Ou utilize:</p>
          
          <div className="flex justify-center space-x-16">
            {/* Google Login */}
            <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
            </button>

            {/* Microsoft Login */}
            <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
              <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                <div className="bg-red-500 w-2 h-2"></div>
                <div className="bg-green-500 w-2 h-2"></div>
                <div className="bg-blue-500 w-2 h-2"></div>
                <div className="bg-yellow-500 w-2 h-2"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className="text-white font-bold text-sm">
            Ainda não tem cadastro?{' '}
            <button 
              onClick={() => router.push('/cadastro')}
              className="text-yellow-300 underline hover:text-yellow-200 transition-colors"
            >
              Cadastre-se!
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
