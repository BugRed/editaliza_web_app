-- Criar tabela users para autenticação
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice no campo login para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_login ON public.users (login);

-- Política de Row Level Security (RLS) - desabilitada por enquanto para APIs internas
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Comentários da tabela
COMMENT ON TABLE public.users IS 'Tabela de usuários para autenticação do sistema Editaliza';
COMMENT ON COLUMN public.users.id IS 'ID único do usuário';
COMMENT ON COLUMN public.users.login IS 'Nome de usuário único';
COMMENT ON COLUMN public.users.password IS 'Senha hash do usuário';
COMMENT ON COLUMN public.users.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN public.users.updated_at IS 'Data da última atualização';
