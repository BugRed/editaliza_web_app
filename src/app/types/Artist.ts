
import { TagData } from "./TagData";
import UserData, { IUserData } from "./Userdata";

// Interface para dados específicos do Artist
export interface IArtist extends IUserData {
  cpf: string;
  listTags: TagData[];
}

// Classe Artist que herda de UserData
export class Artist extends UserData implements IArtist {
  cpf!: string;
  listTags!: TagData[];

  constructor(
    password?: string,
    name?: string,
    email?: string,
    imgUrl?: string,
    cpf?: string
  ) {
    super(password, name, email, imgUrl);
    
    if (cpf) this.cpf = cpf;
    
    // Inicializar valores padrão específicos do Artist
    this.listTags = [];
    this.userType = "ARTIST";
  }

  /**
   * Sobrescreve para retornar o tipo fixo
   */
  getUserType(): string {
    return "ARTIST";
  }

  // Método para validar CPF (implementação básica)
  isValidCpf(): boolean {
    if (!this.cpf) return false;
    
    // Remove caracteres não numéricos
    const cleanCpf = this.cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCpf.length !== 11) return false;
    
    // Verifica se não são todos dígitos iguais
    if (/^(\d)\1+$/.test(cleanCpf)) return false;
    
    // Validação básica dos dígitos verificadores
    let sum = 0;
    let remainder;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;
    
    return true;
  }

  // Método para formatar CPF
  getFormattedCpf(): string {
    if (!this.cpf) return '';
    
    const cleanCpf = this.cpf.replace(/[^\d]/g, '');
    
    if (cleanCpf.length === 11) {
      return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return this.cpf;
  }

  // Validações que substituem os class-validator decorators
  validateCpf(): boolean {
    if (!this.cpf || this.cpf.trim().length === 0) {
      throw new Error("CPF é obrigatório");
    }
    
    if (!this.isValidCpf()) {
      throw new Error("CPF inválido");
    }
    
    return true;
  }

  validateName(): boolean {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error("Nome é obrigatório");
    }
    
    return true;
  }

  validateEmail(): boolean {
    if (!this.email || this.email.trim().length === 0) {
      throw new Error("Email é obrigatório");
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error("Email inválido");
    }
    
    return true;
  }

  // Método para validar todos os campos
  validate(): void {
    this.validateName();
    this.validateEmail();
    this.validateCpf();
  }

  // Método para adicionar tag à lista
  addTag(tag: TagData): void {
    if (!this.listTags.find(t => t.id === tag.id)) {
      this.listTags.push(tag);
      this.updateTimestamp();
    }
  }

  // Método para remover tag da lista
  removeTag(tagId: number): void {
    const index = this.listTags.findIndex(tag => tag.id === tagId);
    if (index > -1) {
      this.listTags.splice(index, 1);
      this.updateTimestamp();
    }
  }

  // Método para verificar se tem uma tag específica
  hasTag(tagId: number): boolean {
    return this.listTags.some(tag => tag.id === tagId);
  }

  // Método para obter nomes das tags
  getTagNames(): string[] {
    return this.listTags.map(tag => tag.name);
  }

  // Método para filtrar tags por cor
  getTagsByColor(color: string): TagData[] {
    return this.listTags.filter(tag => tag.color === color);
  }

  // Sobrescreve o método toJSON para incluir dados específicos do Artist
  toJSON(): IArtist {
    return {
      ...super.toJSON(),
      cpf: this.cpf,
      listTags: this.listTags
    };
  }

  // Método para converter para JSON público (sem CPF)
  toPublicJSON(): Omit<IArtist, 'cpf' | 'password'> {
    const json = this.toJSON();
    const { cpf, password, ...publicData } = json;
    return publicData;
  }

  // Método estático específico para Artist
  static createFromData(data: Partial<IArtist>): Artist {
    const instance = new Artist(
      data.password,
      data.name,
      data.email,
      data.imgUrl,
      data.cpf
    );
    
    // Aplicar outros campos
    if (data.id) instance.id = data.id;
    if (data.createdAt) instance.createdAt = data.createdAt;
    if (data.updatedAt) instance.updatedAt = data.updatedAt;
    if (data.userType) instance.userType = data.userType;
    if (data.listComment) instance.listComment = data.listComment;
    if (data.listTags) instance.listTags = data.listTags;
    
    return instance;
  }
}

// Tipo para dados de entrada na criação de Artist
export interface CreateArtistData {
  password: string;
  name: string;
  email: string;
  cpf: string;
  imgUrl?: string;
  tagIds?: number[]; // IDs das tags ao invés dos objetos completos
}

// Tipo para dados de entrada na atualização de Artist
export interface UpdateArtistData {
  password?: string;
  name?: string;
  email?: string;
  cpf?: string;
  imgUrl?: string;
  tagIds?: number[];
}

// Tipo para resposta da API (sem senha e CPF)
export interface ArtistResponse extends Omit<IArtist, 'password' | 'cpf'> {}

// Tipo para resposta pública do artista
export interface PublicArtistData {
  id: number;
  name: string;
  email: string;
  imgUrl?: string;
  createdAt: Date;
  listTags: TagData[];
}

// Tipo para perfil completo do artista (com CPF para admins)
export interface ArtistProfile extends Omit<IArtist, 'password'> {}

export default Artist;