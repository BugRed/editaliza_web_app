'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { SEEDED_PROFILES } from '@/app/lib/user-profiles';

interface AuthFormProps {
  onSuccess?: () => void;
  isLogin?: boolean;
}

const DEMO_PASSWORDS: Record<string, string> = {
  'joao.silva@email.com': 'senha_segura_1',
  'maria.oliveira@email.com': 'senha_segura_2',
  'carlos.musico@email.com': 'senha_segura_3',
};

export default function AuthForm({ onSuccess, isLogin = true }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.message || 'Erro ao fazer login');
      } else {
        onSuccess?.();
      }
    } catch {
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    const demoPassword = DEMO_PASSWORDS[demoEmail] || 'senha_segura_1';
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setIsLoading(true);
    try {
      const result = await login(demoEmail, demoPassword);
      if (!result.success) {
        setError(result.message || 'Erro ao fazer login');
      } else {
        onSuccess?.();
      }
    } catch {
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {error && (
          <div
            role="alert"
            className="bg-(--danger-soft) border border-(--danger-border) text-(--danger) px-4 py-3 rounded-lg text-sm"
          >
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="auth-email" className="block text-sm font-medium text-(--foreground)">
            E-mail
          </label>
          <input
            id="auth-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg) focus:border-(--primary-fg) transition-colors"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="auth-password" className="block text-sm font-medium text-(--foreground)">
            Senha
          </label>
          <input
            id="auth-password"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-(--background) border border-(--border-subtle) text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg) focus:border-(--primary-fg) transition-colors"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-(--primary) text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-(--primary-hover) transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>

      {isLogin && (
        <div className="pt-3 border-t border-(--border-subtle) space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-(--text-subtle) text-center">
            Contas de teste rápidas
          </p>
          <div className="grid grid-cols-1 gap-2">
            {SEEDED_PROFILES.map((profile) => (
              <button
                key={profile.id}
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin(profile.email)}
                className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-(--accent-soft) hover:bg-(--accent-soft-hover) border border-(--accent)/50 text-left transition-colors cursor-pointer disabled:opacity-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-9 h-9 rounded-full object-cover border border-(--accent) shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-(--foreground) truncate">
                    Entrar como {profile.name}
                  </p>
                  <p className="text-xs text-(--accent-ink) truncate">
                    Artista · {profile.tags.join(' · ')}
                  </p>
                </div>
              </button>
            ))}

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setEmail('empresa.a@email.com');
                setPassword('senha_proposer_1');
                setError('');
                setIsLoading(true);
                login('empresa.a@email.com', 'senha_proposer_1')
                  .then((res) => {
                    if (!res.success) setError(res.message || 'Erro ao fazer login');
                    else onSuccess?.();
                  })
                  .catch(() => setError('Erro interno do servidor'))
                  .finally(() => setIsLoading(false));
              }}
              className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-(--primary-soft) hover:bg-(--primary-soft-hover) border border-(--primary-fg)/30 text-left transition-colors cursor-pointer disabled:opacity-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/edital_pintura_1794791580477.jpg"
                alt="Empresa A Propostas"
                className="w-9 h-9 rounded-full object-cover border border-(--primary-fg) shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-(--foreground) truncate">
                  Entrar como Empresa A Propostas
                </p>
                <p className="text-xs text-(--primary-ink) truncate">
                  Propositor · Publicação de editais
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}