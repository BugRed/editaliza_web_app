'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar automaticamente para login
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-green-600 flex items-center justify-center">
      <div className="text-white text-xl">Redirecionando para login...</div>
    </div>
  );
}
