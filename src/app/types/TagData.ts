// Interface para dados da tag
export interface ITagData {
  id: number;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

// Classe TagData para Next.js
export class TagData implements ITagData {
  id!: number;
  name!: string;
  description!: string;
  color!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(
    name?: string,
    description?: string,
    color?: string
  ) {
    if (name) this.name = name;
    if (description) this.description = description;
    if (color) this.color = color;
    
    // Inicializar valores padrão
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Método para atualizar updatedAt
  updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  // Método para converter para objeto plano (útil para APIs)
  toJSON(): ITagData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.color,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Método estático para criar instância a partir de dados
  static fromData(data: Partial<ITagData>): TagData {
    const instance = new TagData();
    Object.assign(instance, data);
    return instance;
  }

  // Método para validar cor hex
  isValidColor(): boolean {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexColorRegex.test(this.color);
  }

  // Método para validar se o nome é único (seria usado com validação externa)
  validateName(): boolean {
    return !!(this.name && this.name.trim().length > 0);
  }
}

// Tipo para dados de entrada na criação de tag
export interface CreateTagData {
  name: string;
  description: string;
  color: string;
}

// Tipo para dados de entrada na atualização de tag
export interface UpdateTagData {
  name?: string;
  description?: string;
  color?: string;
}

// Tipo para resposta da API
export interface TagDataResponse extends ITagData {}

// Enum para cores predefinidas (opcional)
export enum TagColors {
  RED = '#FF5733',
  BLUE = '#3366FF',
  GREEN = '#33CC33',
  YELLOW = '#FFCC00',
  PURPLE = '#9933CC',
  ORANGE = '#FF8800',
  PINK = '#FF3399',
  GRAY = '#666666'
}

export default TagData;