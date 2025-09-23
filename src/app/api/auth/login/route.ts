import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    // Ler o corpo com mais robustez para evitar erro "body stream already read"
    let body: any = {};
    try {
      const text = await request.text();
      if (!text) {
        return NextResponse.json({ error: 'Corpo da requisição vazio' }, { status: 400 });
      }
      try {
        body = JSON.parse(text);
      } catch (parseError) {
        console.error('Erro ao parsear JSON do corpo:', parseError, 'texto:', text);
        return NextResponse.json({ error: 'Corpo inválido. JSON esperado.' }, { status: 400 });
      }
    } catch (readError: any) {
      console.error('Erro ao ler corpo da requisiç��o:', readError);
      return NextResponse.json({ error: 'Erro ao ler corpo da requisição' }, { status: 400 });
    }

    const { login, password } = body;

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Login e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário no banco de dados
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('login', login)
      .single();

    // Se houver um erro do PostgREST indicando que a tabela não existe, informe o usuário
    if (error) {
      console.error('Erro ao consultar users:', error);
      const message = (error.code === 'PGRST205' || (error.message && error.message.includes('Could not find the table')))
        ? 'Tabela "users" não encontrada no Supabase. Execute SQL de criação.'
        : 'Erro ao consultar usuário.';

      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }

    if (!users) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, users.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: users.id,
        login: users.login 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Criar resposta com cookie httpOnly
    const response = NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        id: users.id,
        login: users.login
      }
    });

    // Definir cookie httpOnly
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 horas
    });

    return response;

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
