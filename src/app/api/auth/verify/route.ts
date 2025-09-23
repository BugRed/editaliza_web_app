import { NextRequest, NextResponse } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token não encontrado', authenticated: false },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      return NextResponse.json({
        authenticated: true,
        user: {
          id: decoded.userId,
          login: decoded.login
        }
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Token inválido', authenticated: false },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Erro na verificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', authenticated: false },
      { status: 500 }
    );
  }
}
