import Edital from "./Edital";
import UserData from "./Userdata";


// Enum para status dos comentários
export enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  HIDDEN = 'HIDDEN',
  FLAGGED = 'FLAGGED'
}

// Interface para dados do comentário
export interface IComment {
  id: number;
  authorName: string;
  content: string;
  approved: boolean;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
  user: UserData;
  edital: Edital;
}

// Classe Comment para Next.js
export class Comment implements IComment {
  id!: number;
  authorName!: string;
  content!: string;
  approved!: boolean;
  status?: string;
  createdAt!: Date;
  updatedAt!: Date;
  user!: UserData;
  edital!: Edital;

  constructor(
    authorName?: string,
    content?: string,
    user?: UserData,
    edital?: Edital,
    approved?: boolean,
    status?: string
  ) {
    if (authorName) this.authorName = authorName;
    if (content) this.content = content;
    if (user) this.user = user;
    if (edital) this.edital = edital;
    
    // Valores padrão
    this.approved = approved ?? false;
    this.status = status || CommentStatus.PENDING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Método para atualizar updatedAt
  updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  // Método para aprovar comentário
  approve(): void {
    this.approved = true;
    this.status = CommentStatus.APPROVED;
    this.updateTimestamp();
  }

  // Método para rejeitar comentário
  reject(): void {
    this.approved = false;
    this.status = CommentStatus.REJECTED;
    this.updateTimestamp();
  }

  // Método para ocultar comentário
  hide(): void {
    this.approved = false;
    this.status = CommentStatus.HIDDEN;
    this.updateTimestamp();
  }

  // Método para marcar como sinalizado
  flag(): void {
    this.status = CommentStatus.FLAGGED;
    this.updateTimestamp();
  }

  // Método para validar conteúdo do comentário
  validateContent(): boolean {
    if (!this.content || this.content.trim().length === 0) {
      return false;
    }
    
    // Verificar se não é muito longo (exemplo: max 1000 caracteres)
    if (this.content.length > 1000) {
      return false;
    }
    
    // Verificar se não é muito curto (exemplo: min 3 caracteres)
    if (this.content.trim().length < 3) {
      return false;
    }
    
    return true;
  }

  // Método para validar nome do autor
  validateAuthorName(): boolean {
    if (!this.authorName || this.authorName.trim().length === 0) {
      return false;
    }
    
    // Verificar se não é muito longo (exemplo: max 100 caracteres)
    if (this.authorName.length > 100) {
      return false;
    }
    
    return true;
  }

  // Método para validar comentário completo
  validate(): void {
    if (!this.validateAuthorName()) {
      throw new Error("Nome do autor é inválido");
    }
    
    if (!this.validateContent()) {
      throw new Error("Conteúdo do comentário é inválido");
    }
    
    if (!this.user) {
      throw new Error("Usuário é obrigatório");
    }
    
    if (!this.edital) {
      throw new Error("Edital é obrigatório");
    }
  }

  // Método para verificar se pode ser editado pelo usuário
  canBeEditedBy(userId: number): boolean {
    return this.user.id === userId && 
           this.status === CommentStatus.PENDING;
  }

  // Método para verificar se pode ser moderado
  canBeModerated(): boolean {
    return [CommentStatus.PENDING, CommentStatus.FLAGGED].includes(this.status as CommentStatus);
  }

  // Método para verificar se é visível publicamente
  isPubliclyVisible(): boolean {
    return this.approved && 
           this.status === CommentStatus.APPROVED;
  }

  // Método para obter resumo do comentário (para listagens)
  getSummary(maxLength: number = 100): string {
    if (this.content.length <= maxLength) {
      return this.content;
    }
    
    return this.content.substring(0, maxLength).trim() + '...';
  }

  // Método para converter para objeto plano
  toJSON(): IComment {
    return {
      id: this.id,
      authorName: this.authorName,
      content: this.content,
      approved: this.approved,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      user: this.user,
      edital: this.edital
    };
  }

  // Método estático para criar instância a partir de dados
  static fromData(data: Partial<IComment>): Comment {
    const instance = new Comment();
    Object.assign(instance, data);
    return instance;
  }
}

// Tipo para dados de entrada na criação de comentário
export interface CreateCommentData {
  authorName: string;
  content: string;
  userId: number; // ID do usuário ao invés do objeto completo
  editalId: number; // ID do edital ao invés do objeto completo
}

// Tipo para dados de entrada na atualização de comentário
export interface UpdateCommentData {
  authorName?: string;
  content?: string;
  approved?: boolean;
  status?: string;
}

// Tipo para resposta da API
export interface CommentResponse extends IComment {}

// Tipo para comentário público (sem dados sensíveis)
export interface PublicCommentData {
  id: number;
  authorName: string;
  content: string;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    imgUrl?: string;
  };
}

// Tipo para comentário resumido (para listagens administrativas)
export interface CommentSummary {
  id: number;
  authorName: string;
  contentSummary: string;
  approved: boolean;
  status?: string;
  createdAt: Date;
  editalTitle: string;
  userName: string;
}

// Tipo para estatísticas de comentários
export interface CommentStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  flagged: number;
}

export default Comment;