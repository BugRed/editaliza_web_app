import { supabase } from '../lib/supabase/client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
}

// Função simples para gerar um token (alternativa ao JWT)
function generateSimpleToken(userId: string, email: string): string {
  const timestamp = Date.now();
  const data = `${userId}-${email}-${timestamp}`;
  
  // Usando btoa para base64 (simulação simples)
  if (typeof btoa === 'function') {
    return btoa(data);
  }
  
  // Fallback para Node.js
  return Buffer.from(data).toString('base64');
}

// Função para verificar o token
function verifySimpleToken(token: string): { userId: string; email: string } | null {
  try {
    let decoded: string;
    
    if (typeof atob === 'function') {
      decoded = atob(token);
    } else {
      decoded = Buffer.from(token, 'base64').toString();
    }
    
    const [userId, email, timestamp] = decoded.split('-');
    
    // Verificar se o token não expirou (1 hora)
    const tokenTime = parseInt(timestamp);
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (currentTime - tokenTime > oneHour) {
      return null;
    }
    
    return { userId, email };
  } catch (error) {
    return null;
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Verificar no Supabase se o usuário existe
      const { data: user, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('email', credentials.email)
        .eq('password', credentials.password)
        .single();

      if (error || !user) {
        return {
          success: false,
          message: 'Email ou senha incorretos'
        };
      }

      // Gerar token simples
      const token = generateSimpleToken(user.id, user.email);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  },

  async verifyToken(token: string): Promise<boolean> {
    try {
      const decoded = verifySimpleToken(token);
      return !!decoded;
    } catch (error) {
      return false;
    }
  },

  async getCurrentUser(token: string) {
    try {
      const decoded = verifySimpleToken(token);
      
      if (!decoded) {
        return null;
      }

      const { data: user } = await supabase
        .from('user_data')
        .select('id, email, name')
        .eq('id', decoded.userId)
        .single();

      return user;
    } catch (error) {
      return null;
    }
  }
};