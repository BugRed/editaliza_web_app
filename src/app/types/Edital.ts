import { TagData } from "./TagData";
import { CommentData } from "./CommentData";
import UserData from "./UserData";

// Enum para status do edital
export enum EditalStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

// Interface para dados do edital
export interface IEdital {
  id: number;
  title: string;
  description: string;
  publishDate: Date | null;
  endDate: Date | null;
  status: string;
  inscriptionLink?: string;
  completeEditalLink?: string;
  imgCoverUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  proposer: UserData;
  listTags: TagData[];
  listComment: CommentData[];
}

// Classe Edital para Next.js
export class Edital implements IEdital {
  id!: number;
  title!: string;
  description!: string;
  publishDate!: Date | null;
  endDate!: Date | null;
  status!: string;
  inscriptionLink?: string;
  completeEditalLink?: string;
  imgCoverUrl?: string;
  createdAt!: Date;
  updatedAt!: Date;
  proposer!: UserData;
  listTags!: TagData[];
  listComment!: CommentData[];

  constructor(
    title?: string,
    description?: string,
    proposer?: UserData,
    publishDate?: Date,
    endDate?: Date,
    status?: string
  ) {
    if (title) this.title = title;
    if (description) this.description = description;
    if (proposer) this.proposer = proposer;
    if (publishDate) this.publishDate = publishDate;
    if (endDate) this.endDate = endDate;
    
    // Valores padrão
    this.status = status || EditalStatus.DRAFT;
    this.listTags = [];
    this.listComment = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.publishDate = this.publishDate || null;
    this.endDate = this.endDate || null;
  }

  // Validação que era feita pelo @BeforeInsert/@BeforeUpdate
  validateProposerType(): void {
    if (this.proposer?.userType !== "PROPOSER") {
      throw new Error("O dono do edital deve ser um PROPOSER");
    }
  }

  // Método para atualizar updatedAt
  updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  // Método para validar dados antes de salvar/atualizar
  validate(): void {
    this.validateProposerType();
    
    // Validações adicionais
    if (!this.title || this.title.trim().length === 0) {
      throw new Error("Título é obrigatório");
    }
    
    if (!this.description || this.description.trim().length === 0) {
      throw new Error("Descrição é obrigatória");
    }
    
    if (this.endDate && this.publishDate && this.endDate <= this.publishDate) {
      throw new Error("Data de encerramento deve ser posterior à data de publicação");
    }
  }

  // Método para adicionar tag
  addTag(tag: TagData): void {
    if (!this.listTags.find(t => t.id === tag.id)) {
      this.listTags.push(tag);
      this.updateTimestamp();
    }
  }

  // Método para remover tag
  removeTag(tagId: number): void {
    const index = this.listTags.findIndex(tag => tag.id === tagId);
    if (index > -1) {
      this.listTags.splice(index, 1);
      this.updateTimestamp();
    }
  }

  // Método para adicionar comentário
  addComment(comment: CommentData): void {
    if (!this.listComment.includes(comment)) {
      this.listComment.push(comment);
      this.updateTimestamp();
    }
  }

  // Método para remover comentário
  removeComment(commentId: number): void {
    const index = this.listComment.findIndex(comment => comment.id === commentId);
    if (index > -1) {
      this.listComment.splice(index, 1);
      this.updateTimestamp();
    }
  }

  // Método para verificar se o edital está aberto para inscrições
  isOpen(): boolean {
    const now = new Date();
    return this.status === EditalStatus.OPEN && 
           this.publishDate !== null && 
           this.publishDate <= now &&
           (this.endDate === null || this.endDate > now);
  }

  // Método para verificar se o edital está expirado
  isExpired(): boolean {
    if (!this.endDate) return false;
    return new Date() > this.endDate;
  }

  // Método para atualizar status baseado nas datas
  updateStatus(): void {
    const now = new Date();
    
    if (this.status === EditalStatus.PUBLISHED && this.publishDate && this.publishDate <= now) {
      this.status = EditalStatus.OPEN;
    }
    
    if (this.status === EditalStatus.OPEN && this.endDate && this.endDate <= now) {
      this.status = EditalStatus.CLOSED;
    }
    
    this.updateTimestamp();
  }

  // Método para converter para objeto plano
  toJSON(): IEdital {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      publishDate: this.publishDate,
      endDate: this.endDate,
      status: this.status,
      inscriptionLink: this.inscriptionLink,
      completeEditalLink: this.completeEditalLink,
      imgCoverUrl: this.imgCoverUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      proposer: this.proposer,
      listTags: this.listTags,
      listComment: this.listComment
    };
  }

  // Método estático para criar instância a partir de dados
  static fromData(data: Partial<IEdital>): Edital {
    const instance = new Edital();
    Object.assign(instance, data);
    
    // Garantir que arrays sejam inicializados
    if (data.listTags) {
      instance.listTags = data.listTags;
    }
    if (data.listComment) {
      instance.listComment = data.listComment;
    }
    
    return instance;
  }
}

// Tipo para dados de entrada na criação de edital
export interface CreateEditalData {
  title: string;
  description: string;
  publishDate?: Date;
  endDate?: Date;
  status?: string;
  inscriptionLink?: string;
  completeEditalLink?: string;
  imgCoverUrl?: string;
  proposerId: number; // ID do proposer ao invés do objeto completo
  tagIds?: number[]; // IDs das tags ao invés dos objetos completos
}

// Tipo para dados de entrada na atualização de edital
export interface UpdateEditalData {
  title?: string;
  description?: string;
  publishDate?: Date;
  endDate?: Date;
  status?: string;
  inscriptionLink?: string;
  completeEditalLink?: string;
  imgCoverUrl?: string;
  tagIds?: number[];
}

// Tipo para resposta da API
export interface EditalResponse extends IEdital {}

// Tipo para edital resumido (para listagens)
export interface EditalSummary {
  id: number;
  title: string;
  description: string;
  publishDate: Date | null;
  endDate: Date | null;
  status: string;
  imgCoverUrl?: string;
  proposer: {
    id: number;
    name: string;
  };
  tagCount: number;
  commentCount: number;
}

export default Edital;